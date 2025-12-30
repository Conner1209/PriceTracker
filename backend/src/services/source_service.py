from src.repositories.source_repository import source_repo
from src.schemas.source_schema import SourceCreate
from typing import List

class SourceService:
    async def create_source(self, source: SourceCreate) -> str:
        return await source_repo.create_source(source)

    async def get_all_sources(self) -> List[dict]:
        return await source_repo.get_all_sources()
    
    async def get_sources_by_product(self, product_id: str) -> List[dict]:
        return await source_repo.get_sources_by_product(product_id)

    async def get_source(self, source_id: str) -> dict:
        return await source_repo.get_source_by_id(source_id)

    async def delete_source(self, source_id: str) -> bool:
        return await source_repo.delete_source(source_id)

source_service = SourceService()
