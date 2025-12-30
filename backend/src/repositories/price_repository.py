from src.repositories.database_repository import db_repo
from datetime import datetime
from typing import List, Optional

class PriceRepository:
    async def add_price_record(self, source_id: str, price: float, success: bool = True, error: str = None) -> None:
        query = """
            INSERT INTO price_history (source_id, price, timestamp, scrape_success, error_message)
            VALUES (?, ?, ?, ?, ?)
        """
        timestamp = datetime.now().isoformat()
        await db_repo.execute(query, (source_id, price, timestamp, 1 if success else 0, error))

    async def get_history_by_source(self, source_id: str, limit: int = 100) -> List[dict]:
        query = "SELECT * FROM price_history WHERE source_id = ? ORDER BY timestamp DESC LIMIT ?"
        return await db_repo.fetch_all(query, (source_id, limit))

    async def get_latest_price(self, source_id: str) -> Optional[dict]:
        query = "SELECT * FROM price_history WHERE source_id = ? ORDER BY timestamp DESC LIMIT 1"
        return await db_repo.fetch_one(query, (source_id,))

price_repo = PriceRepository()
