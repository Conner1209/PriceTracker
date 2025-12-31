# Scheduled Scraping Setup

This guide explains how to set up automatic price scraping using cron on Linux.

## Prerequisites

- PriceTracker running (via Docker or systemd)
- Products and sources configured in the web UI

> **For Docker deployments**, see the Docker-specific section below.

## Quick Setup

### 1. Test the scraper script manually

```bash
cd /path/to/PriceTracker/backend
./venv/bin/python scrape_prices.py
```

You should see output like:
```
2024-01-15 14:30:00 [INFO] PriceTracker Scheduled Scrape Started
2024-01-15 14:30:02 [INFO] Scrape completed: 3/3 successful
2024-01-15 14:30:02 [INFO]   ✓ Source abc12345: $1549.99
2024-01-15 14:30:02 [INFO]   ✓ Source def67890: $1599.00
2024-01-15 14:30:02 [INFO]   ✓ Source ghi24680: $1579.99
2024-01-15 14:30:02 [INFO] All sources scraped successfully
```

### 2. Set up the cron job

Open your crontab:
```bash
crontab -e
```

Add one of these lines depending on your desired frequency:

```bash
# Every 6 hours (recommended for most use cases)
0 */6 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1

# Every 4 hours
0 */4 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1

# Every 12 hours (at midnight and noon)
0 0,12 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1

# Once daily at 3 AM
0 3 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1
```

### 3. Create log file with proper permissions

```bash
sudo touch /var/log/pricetracker-scrape.log
sudo chown $USER:$USER /var/log/pricetracker-scrape.log
```

Or log to your home directory instead:
```bash
0 */6 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> ~/pricetracker-scrape.log 2>&1
```

## Configuration

### Custom API URL

If the backend runs on a different port or host:

```bash
0 */6 * * * cd /path/to/PriceTracker/backend && PRICETRACKER_API_URL=http://192.168.1.100:8000 ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1
```

### Log Rotation

To prevent log files from growing too large, set up logrotate:

```bash
sudo nano /etc/logrotate.d/pricetracker
```

Add:
```
/var/log/pricetracker-scrape.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```

## Troubleshooting

### "Connection failed" errors

1. Check if the backend is running: `curl http://localhost:8000/api/products`
2. Verify the API URL in the cron command

### Scraper runs but no prices recorded

1. Check that sources have valid CSS selectors
2. Test manually: Use the "Fetch Now" button in the web UI
3. Check the scrape response for specific error messages

### Cron job not running

1. Check cron service: `systemctl status cron`
2. View cron logs: `grep CRON /var/log/syslog`
3. Ensure the script is executable: `chmod +x scrape_prices.py`

## Monitoring

### Check recent scrapes

```bash
tail -50 /var/log/pricetracker-scrape.log
```

### Watch live

```bash
tail -f /var/log/pricetracker-scrape.log
```

### Check next scheduled run

```bash
# List your cron jobs
crontab -l
```

## Rate Limiting Considerations

The scraper includes a 2-5 second random delay between requests to avoid being blocked. With many sources, scraping may take several minutes.

**Recommended frequencies by source count:**
- 1-5 sources: Every 4 hours
- 6-20 sources: Every 6 hours  
- 20+ sources: Every 12 hours

Too frequent scraping may result in IP bans from retailers.

---

## Docker Deployment

If running PriceTracker via Docker Compose, use this cron syntax instead:

```bash
crontab -e
```

Add:
```bash
# Every 6 hours (Docker)
0 */6 * * * cd /home/docker/PriceTracker && docker-compose exec -T backend python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1
```

> **Note:** The `-T` flag is required for cron jobs since there's no TTY.

### Test manually:
```bash
docker-compose exec -T backend python scrape_prices.py
```
