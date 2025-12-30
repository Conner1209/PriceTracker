import uuid
from typing import List, Optional
from src.repositories.database_repository import db_repo
from src.schemas.product_schema import ProductCreate

class ProductRepository:
    async def get_all_products(self) -> List[dict]:
        query = "SELECT * FROM products"
        return await db_repo.fetch_all(query)

    async def get_product_by_id(self, product_id: str) -> Optional[dict]:
        query = "SELECT * FROM products WHERE id = ?"
        return await db_repo.fetch_one(query, (product_id,))

    async def create_product(self, product: ProductCreate) -> str:
        product_id = str(uuid.uuid4())
        query = """
            INSERT INTO products (id, name, identifier_type, identifier_value)
            VALUES (?, ?, ?, ?)
        """
        await db_repo.execute(query, (product_id, product.name, product.identifier_type, product.identifier_value))
        return product_id

    async def delete_product(self, product_id: str) -> bool:
        query = "DELETE FROM products WHERE id = ?"
        cursor = await db_repo.execute(query, (product_id,))
        return cursor.rowcount > 0

product_repo = ProductRepository()
