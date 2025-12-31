from src.repositories.database_repository import db_repo
from src.schemas.alert_schema import AlertCreate, AlertUpdate
from datetime import datetime
from typing import List, Optional
import uuid

class AlertRepository:
    async def create_alert(self, alert: AlertCreate) -> str:
        alert_id = str(uuid.uuid4())
        query = """
            INSERT INTO alerts (id, product_id, source_id, target_price, webhook_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        await db_repo.execute(query, (
            alert_id,
            alert.product_id,
            alert.source_id,
            alert.target_price,
            alert.webhook_url,
            1 if alert.is_active else 0
        ))
        return alert_id

    async def get_all_alerts(self) -> List[dict]:
        query = "SELECT * FROM alerts ORDER BY created_at DESC"
        return await db_repo.fetch_all(query)

    async def get_alerts_by_product(self, product_id: str) -> List[dict]:
        query = "SELECT * FROM alerts WHERE product_id = ? ORDER BY created_at DESC"
        return await db_repo.fetch_all(query, (product_id,))

    async def get_alerts_by_source(self, source_id: str) -> List[dict]:
        query = "SELECT * FROM alerts WHERE source_id = ? ORDER BY created_at DESC"
        return await db_repo.fetch_all(query, (source_id,))

    async def get_active_alerts_for_source(self, source_id: str) -> List[dict]:
        """Get active, non-triggered alerts for a source (used during scraping)."""
        query = """
            SELECT * FROM alerts 
            WHERE source_id = ? AND is_active = 1 AND is_triggered = 0
        """
        return await db_repo.fetch_all(query, (source_id,))

    async def get_alert(self, alert_id: str) -> Optional[dict]:
        query = "SELECT * FROM alerts WHERE id = ?"
        return await db_repo.fetch_one(query, (alert_id,))

    async def update_alert(self, alert_id: str, update: AlertUpdate) -> bool:
        existing = await self.get_alert(alert_id)
        if not existing:
            return False
        
        # Build dynamic update query
        updates = []
        params = []
        
        if update.target_price is not None:
            updates.append("target_price = ?")
            params.append(update.target_price)
        if update.webhook_url is not None:
            updates.append("webhook_url = ?")
            params.append(update.webhook_url)
        if update.is_active is not None:
            updates.append("is_active = ?")
            params.append(1 if update.is_active else 0)
            # If reactivating, reset triggered status
            if update.is_active:
                updates.append("is_triggered = 0")
                updates.append("triggered_at = NULL")
        
        if not updates:
            return True  # Nothing to update
        
        params.append(alert_id)
        query = f"UPDATE alerts SET {', '.join(updates)} WHERE id = ?"
        await db_repo.execute(query, tuple(params))
        return True

    async def trigger_alert(self, alert_id: str) -> bool:
        """Mark an alert as triggered."""
        query = """
            UPDATE alerts 
            SET is_triggered = 1, triggered_at = ?
            WHERE id = ?
        """
        timestamp = datetime.now().isoformat()
        await db_repo.execute(query, (timestamp, alert_id))
        return True

    async def delete_alert(self, alert_id: str) -> bool:
        existing = await self.get_alert(alert_id)
        if not existing:
            return False
        query = "DELETE FROM alerts WHERE id = ?"
        await db_repo.execute(query, (alert_id,))
        return True

    # Settings methods
    async def get_setting(self, key: str) -> Optional[str]:
        query = "SELECT value FROM settings WHERE key = ?"
        result = await db_repo.fetch_one(query, (key,))
        return result.get("value") if result else None

    async def set_setting(self, key: str, value: str) -> None:
        query = """
            INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """
        await db_repo.execute(query, (key, value))

alert_repo = AlertRepository()
