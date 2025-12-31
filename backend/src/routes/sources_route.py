from fastapi import APIRouter, HTTPException
from src.schemas.source_schema import SourceCreate, SourceResponse
from src.services.source_service import source_service
from typing import List, Optional

router = APIRouter(prefix="/api/sources", tags=["sources"])

@router.get("/", response_model=dict)
async def list_sources(productId: Optional[str] = None):
    if productId:
        sources = await source_service.get_sources_by_product(productId)
    else:
        sources = await source_service.get_all_sources()
    
    # Convert to SourceResponse and serialize with camelCase aliases
    response_data = [
        SourceResponse(**source).model_dump(by_alias=True) 
        for source in sources
    ]
    return {"success": True, "data": response_data}

@router.post("/", response_model=dict)
async def create_source(source: SourceCreate):
    source_id = await source_service.create_source(source)
    return {"success": True, "data": {"id": source_id}}

@router.delete("/{source_id}", response_model=dict)
async def delete_source(source_id: str):
    success = await source_service.delete_source(source_id)
    if not success:
        return {"success": False, "error": "Source not found"}
    return {"success": True}
