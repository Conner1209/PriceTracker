# Docker Deployment Guide

This guide explains how to deploy PriceTracker using Docker on your home server.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git installed
- Basic terminal knowledge

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Conner1209/PriceTracker.git
cd PriceTracker
```

### 2. Deploy

```bash
# Make deploy script executable (first time only)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:
```bash
docker-compose up -d --build
```

### 3. Access

Open your browser to: `http://your-server-ip:3000`

---

## Updating PriceTracker

When you push new code to GitHub:

```bash
cd /path/to/PriceTracker
./deploy.sh
```

This will:
1. Pull latest code from GitHub
2. Rebuild Docker images
3. Restart containers

---

## Container Management

### View Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only  
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

---

## Data Persistence

Your SQLite database is stored in `./data/pricetracker.db`.

This directory is mounted as a Docker volume, so your data persists even when containers are rebuilt.

### Backup
```bash
cp ./data/pricetracker.db ./backups/pricetracker-$(date +%Y%m%d).db
```

---

## Scheduled Scraping with Cron

Add to your server's crontab:

```bash
crontab -e
```

Add this line (runs every 6 hours):
```bash
0 */6 * * * cd /path/to/PriceTracker && docker-compose exec -T backend python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1
```

> **Note:** The `-T` flag is required for cron jobs since there's no TTY.

---

## Accessing via Tailscale

If you're accessing from your parents' house via Tailscale:

1. Get your server's Tailscale IP: `tailscale ip -4`
2. Access PriceTracker at: `http://100.x.x.x:3000`

### Set Up for Family

1. **Configure default webhook** (for alerts):
   ```bash
   docker-compose exec backend python -c "
   import asyncio
   from src.repositories.alert_repository import alert_repo
   asyncio.run(alert_repo.set_setting('default_webhook_url', 'https://ntfy.sh/pricetracker-family'))
   "
   ```

2. **Family installs Ntfy app** and subscribes to `pricetracker-family`

---

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend
```

### Database issues
```bash
# Ensure data directory exists with correct permissions
mkdir -p ./data
chmod 755 ./data
```

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead of 3000
```

### Rebuild from scratch
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Architecture

```
Internet
    │
    ▼
┌─────────────┐
│   nginx     │  ← Port 3000
│  (frontend) │
├─────────────┤
│ Static React│
│   Assets    │
└──────┬──────┘
       │ /api/* proxy
       ▼
┌─────────────┐
│   uvicorn   │  ← Internal only
│  (backend)  │
├─────────────┤
│  FastAPI    │
│  + SQLite   │
└─────────────┘
```

The frontend nginx server:
- Serves the React app
- Proxies `/api/*` requests to the backend
- Handles SPA routing (all routes → index.html)
