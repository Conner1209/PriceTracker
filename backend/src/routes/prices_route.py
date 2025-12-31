from fastapi import APIRouter
from src.services.price_service import price_service

router = APIRouter(prefix="/api/prices", tags=["prices"])

@router.get("/{source_id}")
async def get_price_history(source_id: str):
    data = await price_service.get_history(source_id)
    
    # Convert snake_case to camelCase for frontend
    camel_case_data = [
        {
            "id": str(record.get("id", "")),
            "sourceId": record.get("source_id", ""),
            "price": record.get("price", 0),
            "currency": record.get("currency", "USD"),
            "fetchedAt": record.get("timestamp", ""),
            "success": bool(record.get("scrape_success", True)),
            "error": record.get("error_message")
        }
        for record in data
    ]
    
    return {"success": True, "data": camel_case_data}
