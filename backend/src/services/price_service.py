from src.repositories.price_repository import price_repo

class PriceService:
    async def get_history(self, source_id: str):
        history = await price_repo.get_history_by_source(source_id)
        # Convert rows (dict) to list of dicts if needed
        return [dict(row) for row in history]

price_service = PriceService()
