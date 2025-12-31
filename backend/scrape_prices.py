#!/usr/bin/env python3
"""
PriceTracker Scheduled Scraper
Standalone script designed to be run via cron.

Usage:
    python scrape_prices.py

Cron example (every 6 hours):
    0 */6 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1

Environment Variables:
    PRICETRACKER_API_URL - Base URL of the API (default: http://localhost:8000)
"""

import os
import sys
import json
import logging
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# Configuration
API_BASE_URL = os.environ.get("PRICETRACKER_API_URL", "http://localhost:8000")
# Use the background endpoint - starts the job and returns immediately
SCRAPER_ENDPOINT = f"{API_BASE_URL}/api/scraper/run"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


def run_scraper():
    """Trigger the scraper API endpoint (background job)."""
    logger.info("=" * 50)
    logger.info("PriceTracker Scheduled Scrape Triggered")
    logger.info(f"API URL: {SCRAPER_ENDPOINT}")
    
    try:
        # Make POST request to trigger background scraper
        request = Request(
            SCRAPER_ENDPOINT,
            method="POST",
            headers={"Content-Type": "application/json"}
        )
        
        with urlopen(request, timeout=30) as response:  # Short timeout - just trigger
            result = json.loads(response.read().decode("utf-8"))
        
        if result.get("success"):
            message = result.get("message", "Scrape job started")
            logger.info(f"✓ {message}")
            logger.info("Scrape is running in the background. Check price history for results.")
            return 0
        else:
            error = result.get("error", "Unknown error")
            logger.error(f"API returned error: {error}")
            return 1
            
    except HTTPError as e:
        logger.error(f"HTTP Error {e.code}: {e.reason}")
        return 1
    except URLError as e:
        logger.error(f"Connection failed: {e.reason}")
        logger.error("Is the PriceTracker backend running?")
        return 1
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse API response: {e}")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return 1
    finally:
        logger.info("=" * 50)


if __name__ == "__main__":
    sys.exit(run_scraper())
