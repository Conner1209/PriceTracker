from fastapi import APIRouter
from src.services.price_service import price_service

router = APIRouter(prefix="/api/prices", tags=["prices"])

@router.get("/{source_id}")
async def get_price_history(source_id: str):
    data = await price_service.get_history(source_id)
    return {"success": True, "data": data}
