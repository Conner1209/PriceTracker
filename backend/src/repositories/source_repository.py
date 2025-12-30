import uuid
from typing import List, Optional
from src.repositories.database_repository import db_repo
from src.schemas.source_schema import SourceCreate

class SourceRepository:
    async def get_all_sources(self) -> List[dict]:
        query = "SELECT * FROM sources"
        return await db_repo.fetch_all(query)

    async def get_sources_by_product(self, product_id: str) -> List[dict]:
        query = "SELECT * FROM sources WHERE product_id = ?"
        return await db_repo.fetch_all(query, (product_id,))

    async def get_source_by_id(self, source_id: str) -> Optional[dict]:
        query = "SELECT * FROM sources WHERE id = ?"
        return await db_repo.fetch_one(query, (source_id,))

    async def create_source(self, source: SourceCreate) -> str:
        source_id = str(uuid.uuid4())
        query = """
            INSERT INTO sources (id, product_id, store_name, url, css_selector, json_path, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        await db_repo.execute(query, (
            source_id, 
            source.product_id, 
            source.store_name, 
            source.url, 
            source.css_selector, 
            source.json_path, 
            1 if source.is_active else 0
        ))
        return source_id

    async def delete_source(self, source_id: str) -> bool:
        query = "DELETE FROM sources WHERE id = ?"
        cursor = await db_repo.execute(query, (source_id,))
        return cursor.rowcount > 0

source_repo = SourceRepository()
