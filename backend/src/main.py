"""PriceTracker API - FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import products_route, sources_route, scraper_route, prices_route, alerts_route, url_parser_route
from src.repositories.database_repository import db_repo
import os

app = FastAPI(
    title="PriceTracker API",
    description="Self-hosted price monitoring with global identifier tracking",
    version="0.1.0",
    redirect_slashes=False,  # Prevent 307 redirects that break Docker proxy
)

# CORS - allow all origins for Docker/self-hosted deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # Initialize Database - schema is in src/ to avoid being overwritten by volume mount
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if os.path.exists(schema_path):
        await db_repo.init_db(schema_path)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"success": True, "data": {"status": "ok", "version": "0.1.0"}}


@app.get("/api/health")
def health():
    """API health check."""
    return {"success": True, "data": {"status": "healthy"}}

# Register Routers
app.include_router(products_route.router)
app.include_router(sources_route.router)
app.include_router(scraper_route.router)
app.include_router(prices_route.router)
app.include_router(alerts_route.router)
app.include_router(url_parser_route.router)


