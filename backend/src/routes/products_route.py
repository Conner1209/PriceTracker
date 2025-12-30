from fastapi import APIRouter, HTTPException
from src.schemas.product_schema import ProductCreate, ProductResponse
from src.services.product_service import product_service
from typing import List

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/", response_model=dict)
async def list_products():
    products = await product_service.get_all_products()
    return {"success": True, "data": products}

@router.post("/", response_model=dict)
async def create_product(product: ProductCreate):
    product_id = await product_service.create_product(product)
    return {"success": True, "data": {"id": product_id}}

@router.delete("/{product_id}", response_model=dict)
async def delete_product(product_id: str):
    success = await product_service.delete_product(product_id)
    if not success:
        return {"success": False, "error": "Product not found"}
    return {"success": True}
