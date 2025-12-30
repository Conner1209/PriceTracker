# PiTracker: Professional IoT Price Monitoring

## 1. Concept Overview
PiTracker is a lightweight, self-hosted price monitoring solution designed specifically for low-power edge devices like the **Raspberry Pi Zero 2 W**. Unlike general-purpose scrapers, PiTracker prioritizes **Global Identifiers** (EAN, UPC, ASIN, MPN) over fragile store-specific SKUs to ensure cross-retailer data integrity.

### Core Value Propositions:
- **Identifier-First Tracking**: Uses standardized industry codes to map the same physical product across disparate web stores.
- **Resource Optimized**: Designed to run with minimal RAM footprint (< 256MB) and low CPU overhead.
- **Privacy Centric**: All scraping logic and price history reside on your local network.

---

## 2. Current Architecture vs. Production Requirements
The current application serves as a **Management Architect** and **UI Prototype**. To transition this into hostable, functional software, the following components are required:

### A. Persistent Backend (Python/Flask)
The current frontend state needs to be mirrored in a database.
- **Database**: SQLite is recommended for Pi hardware due to its zero-config and file-based nature.
- **API**: A Flask or FastAPI layer to handle CRUD operations for products and sources.

### B. The Scraper Engine (BeautifulSoup4)
A modular Python script (e.g., `tracker.py`) that:
- Executes in the background via `cron` or a `systemd timer`.
- Implements randomized `User-Agent` headers and request delays to avoid IP blacklisting.
- Parses `ld+json` (Structured Data) blocks from websites to find prices reliably, even if the CSS layout changes.

### C. Networking & Discovery
For a seamless "app-like" experience on a Pi:
- **mDNS (Avahi)**: To allow access via `http://pitracker.local`.
- **Reverse Proxy**: Nginx to serve the compiled React frontend and proxy API requests to the Python backend.

---

## 3. Roadmap to "Production Ready"

### Phase 1: Persistence
- Implement the SQLite schema for `products`, `sources`, and `price_history`.
- Create the Python API endpoints to replace the mock React state.

### Phase 2: Automation
- Build the `tracker.py` execution loop.
- Implement a "Manual Trigger" button in the UI that communicates with the backend via WebSockets or long-polling to show real-time scraping progress.

### Phase 3: Hardware Hardening
- **Read-Only Filesystem**: Configure the Pi to run with an overlay FS to prevent SD card corruption during power loss.
- **Telemetry**: Add system-level monitoring (CPU temp, RAM usage) to the dashboard.

### Phase 4: Distribution
- Create a `setup.sh` script or a **Docker Compose** file to automate the installation of dependencies (Python, Nginx, Node) on a fresh Raspberry Pi OS image.

---

## 4. Why Raspberry Pi Zero 2 W?
While this software can run on any Linux box, the Zero 2 W is the target hardware because it balances cost ($15) and performance (Quad-core 64-bit). PiTracker's logic is specifically tuned to avoid heavy browser automation (Selenium/Playwright), opting instead for raw HTTP requests and lightweight HTML parsing.
