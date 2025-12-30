import aiosqlite
import os
from typing import List, Any, Optional, Dict

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "db", "pricetracker.db")

class DatabaseRepository:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._connection = None

    async def connect(self):
        if not self._connection:
            self._connection = await aiosqlite.connect(self.db_path)
            self._connection.row_factory = aiosqlite.Row

    async def close(self):
        if self._connection:
            await self._connection.close()
            self._connection = None

    async def execute(self, query: str, values: tuple = ()) -> aiosqlite.Cursor:
        await self.connect()
        async with self._connection.execute(query, values) as cursor:
            await self._connection.commit()
            return cursor

    async def fetch_all(self, query: str, values: tuple = ()) -> List[dict]:
        await self.connect()
        async with self._connection.execute(query, values) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def fetch_one(self, query: str, values: tuple = ()) -> Optional[dict]:
        await self.connect()
        async with self._connection.execute(query, values) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def init_db(self, schema_path: str):
        await self.connect()
        with open(schema_path, "r") as f:
            schema = f.read()
        await self._connection.executescript(schema)

# Singleton instance
db_repo = DatabaseRepository()
