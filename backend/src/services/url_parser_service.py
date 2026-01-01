"""URL Parser Service - Extracts store, identifier, and product info from URLs."""

import re
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from typing import Optional


class UrlParserService:
    """Parses product URLs to auto-detect store, identifier, and product name."""

    # Store patterns with CSS selectors (mirrored from frontend STORE_PRESETS)
    STORE_PATTERNS = {
        'amazon.com': {
            'name': 'Amazon',
            'selector': '.a-price .a-offscreen',
            'identifier_type': 'ASIN'
        },
        'bestbuy.com': {
            'name': 'Best Buy',
            'selector': '.priceView-customer-price span'
        },
        'walmart.com': {
            'name': 'Walmart',
            'selector': '[itemprop="price"]'
        },
        'target.com': {
            'name': 'Target',
            'selector': '[data-test="product-price"]'
        },
        'newegg.com': {
            'name': 'Newegg',
            'selector': '.price-current'
        },
        'bhphotovideo.com': {
            'name': 'B&H Photo',
            'selector': '[data-selenium="pricingPrice"]'
        },
        'microcenter.com': {
            'name': 'Micro Center',
            'selector': '#pricing'
        },
        'ebay.com': {
            'name': 'eBay',
            'selector': '.x-price-primary span'
        },
    }

    def _extract_hostname(self, url: str) -> Optional[str]:
        """Extract clean hostname from URL (removes www. prefix)."""
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.lower()
            # Remove www. prefix
            if hostname.startswith('www.'):
                hostname = hostname[4:]
            return hostname
        except Exception:
            return None

    def _extract_amazon_asin(self, url: str) -> Optional[str]:
        """Extract ASIN from Amazon URL paths like /dp/XXXXXXXXXX or /gp/product/XXXXXXXXXX."""
        patterns = [
            r'/dp/([A-Z0-9]{10})',
            r'/gp/product/([A-Z0-9]{10})',
            r'/gp/aw/d/([A-Z0-9]{10})',  # Mobile URLs
        ]
        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        return None

    def parse_url(self, url: str) -> dict:
        """
        Parse a product URL and return detected store info.
        
        Returns:
            {
                "url": str,
                "storeName": str | None,
                "cssSelector": str | None,
                "identifierType": str | None,
                "identifierValue": str | None,
                "detected": bool  # True if store was recognized
            }
        """
        result = {
            "url": url,
            "storeName": None,
            "cssSelector": None,
            "identifierType": None,
            "identifierValue": None,
            "detected": False
        }

        hostname = self._extract_hostname(url)
        if not hostname:
            return result

        # Find matching store
        for domain, config in self.STORE_PATTERNS.items():
            if hostname.endswith(domain):
                result["storeName"] = config["name"]
                result["cssSelector"] = config["selector"]
                result["detected"] = True

                # Extract identifier if supported
                if config.get("identifier_type") == "ASIN" and "amazon" in domain:
                    asin = self._extract_amazon_asin(url)
                    if asin:
                        result["identifierType"] = "ASIN"
                        result["identifierValue"] = asin

                break

        return result

    async def fetch_product_title(self, url: str) -> Optional[str]:
        """
        Fetch the product page and extract the title.
        Returns cleaned product name or None if failed.
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                html = response.text

            soup = BeautifulSoup(html, "html.parser")
            
            # Try <title> first
            title_tag = soup.find("title")
            if title_tag:
                title = title_tag.get_text().strip()
                # Clean up common suffixes
                suffixes_to_remove = [
                    " - Amazon.com",
                    " | Amazon.com",
                    ": Amazon.com",
                    " - Best Buy",
                    " | Best Buy",
                    " - Walmart.com",
                    " | Walmart.com",
                    " - Target",
                    " | Target",
                    " - Newegg.com",
                    " | Newegg.com",
                    " - B&H Photo",
                    " | B&H Photo",
                    " - Micro Center",
                    " | Micro Center",
                    " | eBay",
                    " - eBay",
                ]
                for suffix in suffixes_to_remove:
                    if title.endswith(suffix):
                        title = title[:-len(suffix)]
                        break
                
                # Truncate if too long (some titles are very verbose)
                if len(title) > 100:
                    title = title[:97] + "..."
                
                return title if title else None

            return None
        except Exception as e:
            print(f"Failed to fetch product title: {e}")
            return None


url_parser_service = UrlParserService()
