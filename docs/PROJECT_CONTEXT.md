# PriceTracker Project Context
<!-- AI AGENT SPIN-UP DOCUMENT - Optimized for LLM context consumption -->
<!-- Last Updated: 2025-12-31 -->
<!-- Version: 0.3 -->

## QUICK REFERENCE

```yaml
Project: PriceTracker - Self-hosted price monitoring with global identifier tracking
Stack: React + TypeScript (Vite) | Python + FastAPI + SQLite
Target: Debian Linux (primary), Windows (supported)
Owner: Conner1209
Repo: github.com/Conner1209/PriceTracker
```

---

## ARCHITECTURE OVERVIEW

### Directory Structure
```
PriceTracker/
├── frontend/                     # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Primitives (Toast, Icons)
│   │   │   ├── layout/           # Header, Footer
│   │   │   └── features/
│   │   │       ├── products/     # DesignView, PreviewView
│   │   │       ├── alerts/       # AlertModal, AlertBadge
│   │   │       └── charts/       # PriceChart
│   │   ├── context/
│   │   ├── hooks/                # useProducts, useData
│   │   ├── services/api.ts       # API client
│   │   └── types/
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/               # *_route.py (products, sources, scraper, prices, alerts)
│   │   ├── services/             # *_service.py (scraper, alert)
│   │   ├── repositories/         # *_repository.py (database, product, source, price, alert)
│   │   └── schemas/              # *_schema.py (product, source, alert)
│   ├── db/schema.sql
│   ├── scrape_prices.py          # Standalone cron script
│   └── requirements.txt
├── docs/
│   ├── PROJECT_CONTEXT.md        # This file
│   └── SCHEDULED_SCRAPING.md     # Cron setup guide
└── docker-compose.yml
```

---

## NAMING CONVENTIONS

### Frontend (React/TypeScript)
| Type | Pattern | Example |
|------|---------|---------|
| Components | **PascalCase** `.tsx` | `ProductCard.tsx` |
| Hooks | **camelCase** `use*.ts` | `useProducts.ts` |
| Contexts | **PascalCase** `*Context.tsx` | `DataContext.tsx` |
| Utilities | **camelCase** `*.util.ts` | `price.util.ts` |
| Tests | `__tests__/*.test.tsx` | `ProductCard.test.tsx` |

### Backend (Python)
| Type | Pattern | Example |
|------|---------|---------|
| Routes | `*_route.py` | `products_route.py` |
| Services | `*_service.py` | `scraper_service.py` |
| Repositories | `*_repository.py` | `database_repository.py` |
| Schemas | `*_schema.py` | `product_schema.py` |

### Path Aliases
- Frontend: `@/` maps to `frontend/src/`

---

## KEY DOMAIN CONCEPTS

### IdentifierType
```typescript
type IdentifierType = 'SKU' | 'EAN' | 'UPC' | 'ASIN' | 'MPN';
```
Global identifiers enable cross-retailer product matching.

### Product
```typescript
interface Product {
  id: string;
  name: string;
  identifierType: IdentifierType;
  identifierValue: string;
}
```

### Source
```typescript
interface Source {
  id: string;
  productId: string;
  storeName: string;
  url: string;
  cssSelector: string;
}
```

### Alert
```typescript
interface Alert {
  id: string;
  productId: string;
  sourceId: string;
  targetPrice: number;
  webhookUrl?: string;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
}
```

### PriceRecord
```typescript
interface PriceRecord {
  timestamp: string;
  price: number;
  sourceId: string;
}
```

---

## API ENDPOINTS

### Products & Sources
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | List products |
| `/api/products` | POST | Create product |
| `/api/products/:id` | DELETE | Delete product |
| `/api/sources` | GET | List sources (optional `?productId=`) |
| `/api/sources` | POST | Create source |
| `/api/sources/:id` | DELETE | Delete source |

### Scraper
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/scraper/run` | POST | Trigger background scrape (all) |
| `/api/scraper/run-sync` | POST | Sync scrape (blocks, returns results) |
| `/api/scraper/test/:sourceId` | POST | Scrape single source |

### Prices
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prices/:sourceId` | GET | Price history for source |

### Alerts
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/alerts` | GET | List alerts (`?sourceId=` or `?productId=`) |
| `/api/alerts` | POST | Create alert |
| `/api/alerts/:id` | PUT | Update alert |
| `/api/alerts/:id` | DELETE | Delete alert |
| `/api/alerts/settings/webhook` | GET/PUT | Default webhook URL |

---

## DEV TESTING WORKFLOW

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn src.main:app --reload  # http://localhost:8000
```

### API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## SCHEDULED SCRAPING

### Cron Setup (Linux)
```bash
# Every 6 hours
0 */6 * * * cd /path/to/PriceTracker/backend && ./venv/bin/python scrape_prices.py >> /var/log/pricetracker-scrape.log 2>&1
```

See `docs/SCHEDULED_SCRAPING.md` for full setup guide.

---

## ALERT NOTIFICATIONS

Uses webhook-based notifications, designed for **Ntfy.sh**:
- Push notifications to iOS/Android
- No account required - just subscribe to a topic
- Default webhook stored in `settings` table

### Payload Format
```json
{
  "title": "🎉 Price Drop Alert!",
  "message": "Product dropped to $X at Store (target: $Y)",
  "priority": 4,
  "click": "https://store.com/product-url"
}
```

---

## GITHUB WORKFLOW

```typescript
// List issues
mcp_github_list_issues({ owner: 'Conner1209', repo: 'PriceTracker', state: 'open' })

// Close issue
mcp_github_update_issue({ owner: 'Conner1209', repo: 'PriceTracker', issue_number: X, state: 'closed' })
```

---

## CURRENT STATUS

**Phase: Beta Ready**

### Completed Issues
- [x] #3 Connect Frontend to Backend
- [x] #4 Scraper Engine Implementation
- [x] #5 Fetch Now Trigger
- [x] #6 Price History Charts (closed as duplicate)
- [x] #7 Price Drop Alerts
- [x] #10 Source Management UI
- [x] #11 Scheduled Background Scraping

### Open Issues
- [ ] #8 Docker Compose Setup
- [ ] #9 Production Deployment (systemd + nginx)

---

## KEY DEPENDENCIES

### Backend
- **FastAPI** - Web framework
- **httpx** - Async HTTP client for scraping
- **BeautifulSoup4** - HTML parsing
- **aiohttp** - Async HTTP for webhooks
- **aiosqlite** - Async SQLite

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Price charts
- **Font Awesome** - Icons

---

<!-- END OF AI CONTEXT DOCUMENT -->
