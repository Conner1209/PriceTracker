from src.repositories.alert_repository import alert_repo
from src.schemas.alert_schema import AlertCreate, AlertUpdate, AlertResponse
from typing import List, Optional
import logging
import aiohttp
import json

logger = logging.getLogger(__name__)

# Default webhook setting key
DEFAULT_WEBHOOK_KEY = "default_webhook_url"

class AlertService:
    async def create_alert(self, alert: AlertCreate) -> str:
        return await alert_repo.create_alert(alert)

    async def get_all_alerts(self) -> List[dict]:
        return await alert_repo.get_all_alerts()

    async def get_alerts_by_product(self, product_id: str) -> List[dict]:
        return await alert_repo.get_alerts_by_product(product_id)

    async def get_alerts_by_source(self, source_id: str) -> List[dict]:
        return await alert_repo.get_alerts_by_source(source_id)

    async def get_alert(self, alert_id: str) -> Optional[dict]:
        return await alert_repo.get_alert(alert_id)

    async def update_alert(self, alert_id: str, update: AlertUpdate) -> bool:
        return await alert_repo.update_alert(alert_id, update)

    async def delete_alert(self, alert_id: str) -> bool:
        return await alert_repo.delete_alert(alert_id)

    async def get_default_webhook(self) -> Optional[str]:
        return await alert_repo.get_setting(DEFAULT_WEBHOOK_KEY)

    async def set_default_webhook(self, url: str) -> None:
        await alert_repo.set_setting(DEFAULT_WEBHOOK_KEY, url)

    async def check_price_against_alerts(
        self, 
        source_id: str, 
        current_price: float,
        product_name: str = "Product",
        store_name: str = "Store",
        product_url: str = None
    ) -> List[dict]:
        """
        Check if current price triggers any alerts for this source.
        Returns list of triggered alerts.
        """
        triggered_alerts = []
        
        # Get active, non-triggered alerts for this source
        alerts = await alert_repo.get_active_alerts_for_source(source_id)
        
        for alert in alerts:
            target_price = alert.get("target_price", 0)
            
            if current_price <= target_price:
                # Alert triggered!
                alert_id = alert.get("id")
                logger.info(f"Alert {alert_id} triggered! Price ${current_price} <= target ${target_price}")
                
                # Mark as triggered
                await alert_repo.trigger_alert(alert_id)
                
                # Send notification
                webhook_url = alert.get("webhook_url") or await self.get_default_webhook()
                
                if webhook_url:
                    await self.send_notification(
                        webhook_url=webhook_url,
                        product_name=product_name,
                        store_name=store_name,
                        current_price=current_price,
                        target_price=target_price,
                        product_url=product_url
                    )
                else:
                    logger.warning(f"Alert {alert_id} triggered but no webhook configured")
                
                triggered_alerts.append(alert)
        
        return triggered_alerts

    async def send_notification(
        self,
        webhook_url: str,
        product_name: str,
        store_name: str,
        current_price: float,
        target_price: float,
        product_url: str = None
    ) -> bool:
        """
        Send notification via webhook (designed for Ntfy.sh but works with others).
        """
        # Ntfy.sh-compatible payload
        payload = {
            "title": "🎉 Price Drop Alert!",
            "message": f"{product_name} dropped to ${current_price:.2f} at {store_name} (target: ${target_price:.2f})",
            "priority": 4,  # High priority
            "tags": ["moneybag", "chart_with_downwards_trend"]
        }
        
        if product_url:
            payload["click"] = product_url
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status in (200, 201, 204):
                        logger.info(f"Notification sent successfully to {webhook_url}")
                        return True
                    else:
                        text = await response.text()
                        logger.error(f"Webhook failed with status {response.status}: {text}")
                        return False
        except aiohttp.ClientError as e:
            logger.error(f"Failed to send notification: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending notification: {e}")
            return False

alert_service = AlertService()
