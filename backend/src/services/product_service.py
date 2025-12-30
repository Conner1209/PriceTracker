from src.repositories.product_repository import product_repo
from src.schemas.product_schema import ProductCreate
from typing import List

class ProductService:
    async def create_product(self, product: ProductCreate) -> str:
        # Future: Add validation logic here
        return await product_repo.create_product(product)

    async def get_all_products(self) -> List[dict]:
        return await product_repo.get_all_products()

    async def get_product(self, product_id: str) -> dict:
        return await product_repo.get_product_by_id(product_id)

    async def delete_product(self, product_id: str) -> bool:
        return await product_repo.delete_product(product_id)

product_service = ProductService()
