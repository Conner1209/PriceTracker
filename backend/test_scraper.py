import httpx
import asyncio

BASE = "http://localhost:8000/api"

async def main():
    async with httpx.AsyncClient(follow_redirects=True) as client:
        # 1. Create Product
        print("Creating product...")
        res = await client.post(f"{BASE}/products", json={
            "name": "Test Book", 
            "identifierType": "SKU", 
            "identifierValue": "BOOK123"
        })
        print(res.text)
        p_id = res.json()["data"]["id"]
        print(f"Product Created: {p_id}")

        # 2. Create Source
        print("Creating source...")
        res = await client.post(f"{BASE}/sources", json={
            "productId": p_id,
            "storeName": "BooksToScrape",
            "url": "http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
            "cssSelector": ".price_color",
            "isActive": True
        })
        print(res.text)
        s_id = res.json()["data"]["id"]
        print(f"Source Created: {s_id}")

        # 3. Run Scrape
        print("Running scraper...")
        res = await client.post(f"{BASE}/scraper/run-sync", timeout=30.0)
        print(f"Scrape Result: {res.json()}")

        # 4. Get History
        print("Fetching history...")
        res = await client.get(f"{BASE}/prices/{s_id}")
        print(f"History: {res.json()}")

if __name__ == "__main__":
    asyncio.run(main())
