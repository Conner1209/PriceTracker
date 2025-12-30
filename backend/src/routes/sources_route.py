from fastapi import APIRouter, HTTPException
from src.schemas.source_schema import SourceCreate, SourceResponse
from src.services.source_service import source_service
from typing import List, Optional

router = APIRouter(prefix="/api/sources", tags=["sources"])

@router.get("/", response_model=dict)
async def list_sources(productId: Optional[str] = None):
    # Support camelCase query param too for consistency? 
    # FastAPI usually expects snake_case_param unless aliased.
    # Let's check both or just standard snake_case product_id if we want pythonic.
    # But frontend might send `?productId=...`
    # Let's stick to consistent camelCase if possible or snake_case for query params.
    # Standard is kebab-case or snake_case in URLs.
    # I'll use `product_id` (snake) as python standard, frontend can adapt.
    if productId:
        sources = await source_service.get_sources_by_product(productId)
    else:
        sources = await source_service.get_all_sources()
    return {"success": True, "data": sources}

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
