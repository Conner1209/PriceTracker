import httpx
import re
from bs4 import BeautifulSoup
from src.repositories.source_repository import source_repo
from src.repositories.price_repository import price_repo
from src.services.alert_service import alert_service
from typing import Dict, Any

class ScraperService:
    def _clean_price(self, text: str) -> float:
        text = text.strip()
        # Regex to find number: optional currency symbols, then numbers with optional commas and decimals
        # Simple extraction: remove non-numeric except .
        # But 1,200.00 needs to become 1200.00
        # Strategy: Keep digits and dots. Remove commas.
        # Check if comma is used as decimal separator (European)? 
        # For now assume Standard US/UK (comma = thousand, dot = decimal)
        
        # Regex: find the first sequence that looks like a price
        match = re.search(r'[\d,]+\.?\d*', text)
        if match:
             # Remove commas
             clean = match.group(0).replace(',', '')
             # If multiple dots, keep only last? Or just parse float
             try:
                return float(clean)
             except:
                pass
        raise ValueError(f"Could not extract price from '{text}'")

    async def scrape_source(self, source_id: str) -> float:
        source = await source_repo.get_source_by_id(source_id)
        if not source:
            raise ValueError("Source not found")
        
        url = source['url']
        selector = source['css_selector']
        
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                html = response.text

            if not selector:
                raise ValueError("No CSS selector defined")

            soup = BeautifulSoup(html, "html.parser")
            elements = soup.select(selector)
            if not elements:
                raise ValueError(f"Element not found for selector: {selector}")
            
            price_text = elements[0].get_text()
            price = self._clean_price(price_text)
            
            await price_repo.add_price_record(source_id, price, success=True)
            
            # Check if this price triggers any alerts
            await alert_service.check_price_against_alerts(
                source_id=source_id,
                current_price=price,
                product_name=source.get('product_name', 'Product'),
                store_name=source.get('store_name', 'Store'),
                product_url=source.get('url')
            )
            
            return price
            
        except Exception as e:
            await price_repo.add_price_record(source_id, 0.0, success=False, error=str(e))
            raise e

    async def scrape_all_active(self) -> Dict[str, Any]:
        sources = await source_repo.get_all_sources()
        results = {"success": 0, "failed": 0, "details": []}
        
        for source in sources:
            # Check is_active (sqlite returns 1 or 0)
            if source['is_active']:
                try:
                    price = await self.scrape_source(source['id'])
                    results["details"].append({"id": source['id'], "status": "success", "price": price})
                    results["success"] += 1
                except Exception as e:
                    results["details"].append({"id": source['id'], "status": "failed", "error": str(e)})
                    results["failed"] += 1
        return results

scraper_service = ScraperService()
