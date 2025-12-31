from fastapi import APIRouter, HTTPException
from src.services.alert_service import alert_service
from src.schemas.alert_schema import AlertCreate, AlertUpdate, AlertResponse
from typing import Optional

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("/")
async def list_alerts(productId: Optional[str] = None, sourceId: Optional[str] = None):
    """List all alerts, optionally filtered by product or source."""
    if sourceId:
        alerts = await alert_service.get_alerts_by_source(sourceId)
    elif productId:
        alerts = await alert_service.get_alerts_by_product(productId)
    else:
        alerts = await alert_service.get_all_alerts()
    
    # Convert to camelCase response
    response_data = [
        {
            "id": a.get("id"),
            "productId": a.get("product_id"),
            "sourceId": a.get("source_id"),
            "targetPrice": a.get("target_price"),
            "webhookUrl": a.get("webhook_url"),
            "isActive": bool(a.get("is_active", True)),
            "isTriggered": bool(a.get("is_triggered", False)),
            "createdAt": a.get("created_at"),
            "triggeredAt": a.get("triggered_at")
        }
        for a in alerts
    ]
    return {"success": True, "data": response_data}

@router.post("/")
async def create_alert(alert: AlertCreate):
    """Create a new price alert."""
    alert_id = await alert_service.create_alert(alert)
    return {"success": True, "data": {"id": alert_id}}

@router.get("/{alert_id}")
async def get_alert(alert_id: str):
    """Get a specific alert by ID."""
    alert = await alert_service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    response_data = {
        "id": alert.get("id"),
        "productId": alert.get("product_id"),
        "sourceId": alert.get("source_id"),
        "targetPrice": alert.get("target_price"),
        "webhookUrl": alert.get("webhook_url"),
        "isActive": bool(alert.get("is_active", True)),
        "isTriggered": bool(alert.get("is_triggered", False)),
        "createdAt": alert.get("created_at"),
        "triggeredAt": alert.get("triggered_at")
    }
    return {"success": True, "data": response_data}

@router.put("/{alert_id}")
async def update_alert(alert_id: str, update: AlertUpdate):
    """Update an existing alert."""
    success = await alert_service.update_alert(alert_id, update)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True}

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):
    """Delete an alert."""
    success = await alert_service.delete_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True}

# Settings endpoints
@router.get("/settings/webhook")
async def get_default_webhook():
    """Get the default webhook URL."""
    url = await alert_service.get_default_webhook()
    return {"success": True, "data": {"webhookUrl": url}}

@router.put("/settings/webhook")
async def set_default_webhook(body: dict):
    """Set the default webhook URL."""
    url = body.get("webhookUrl", "")
    await alert_service.set_default_webhook(url)
    return {"success": True}
