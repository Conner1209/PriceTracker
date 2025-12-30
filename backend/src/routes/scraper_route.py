from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.services.scraper_service import scraper_service

router = APIRouter(prefix="/api/scraper", tags=["scraper"])

@router.post("/run", response_model=dict)
async def run_scraper(background_tasks: BackgroundTasks):
    """Trigger a full scrape job in the background."""
    background_tasks.add_task(scraper_service.scrape_all_active)
    return {"success": True, "message": "Scrape job started in background"}

@router.post("/run-sync", response_model=dict)
async def run_scraper_sync():
    """Trigger a full scrape job synchronously (waits for completion)."""
    results = await scraper_service.scrape_all_active()
    return {"success": True, "data": results}

@router.post("/test/{source_id}", response_model=dict)
async def test_scrape_source(source_id: str):
    """Test scrape a specific source by ID."""
    try:
        price = await scraper_service.scrape_source(source_id)
        return {"success": True, "data": {"price": price}}
    except Exception as e:
        return {"success": False, "error": str(e)}
