"""URL Parser Routes - Endpoint for auto-detecting store info from URLs."""

from fastapi import APIRouter
from pydantic import BaseModel
from src.services.url_parser_service import url_parser_service

router = APIRouter(prefix="/api/url", tags=["URL Parser"])


class ParseUrlRequest(BaseModel):
    url: str
    fetchTitle: bool = True  # Whether to scrape page for product name


class ParseUrlResponse(BaseModel):
    url: str
    storeName: str | None
    cssSelector: str | None
    identifierType: str | None
    identifierValue: str | None
    suggestedName: str | None
    detected: bool


@router.post("/parse")
async def parse_url(request: ParseUrlRequest):
    """
    Parse a product URL to auto-detect store, CSS selector, and identifier.
    Optionally fetches the page to extract product name.
    """
    # Parse URL for store detection
    parsed = url_parser_service.parse_url(request.url)
    
    # Optionally fetch product title
    suggested_name = None
    if request.fetchTitle:
        suggested_name = await url_parser_service.fetch_product_title(request.url)
    
    return {
        "success": True,
        "data": ParseUrlResponse(
            url=parsed["url"],
            storeName=parsed["storeName"],
            cssSelector=parsed["cssSelector"],
            identifierType=parsed["identifierType"],
            identifierValue=parsed["identifierValue"],
            suggestedName=suggested_name,
            detected=parsed["detected"]
        )
    }
