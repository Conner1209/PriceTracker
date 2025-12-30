# PriceTracker Project Context
<!-- AI AGENT SPIN-UP DOCUMENT - Optimized for LLM context consumption -->
<!-- Last Updated: 2025-12-30 -->
<!-- Version: 0.1 -->

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
│   │   │       ├── products/     # Product management
│   │   │       ├── sources/      # Source management
│   │   │       └── dashboard/    # Price charts
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/api.ts
│   │   └── types/
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/*_route.py
│   │   ├── services/*_service.py
│   │   ├── repositories/*_repository.py
│   │   └── schemas/*_schema.py
│   ├── db/schema.sql
│   └── requirements.txt
├── docs/
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

### PriceRecord
```typescript
interface PriceRecord {
  timestamp: string;
  price: number;
  sourceId: string;
}
```

---

## API PATTERNS

### Response Format
```python
{"success": True, "data": {...}}
{"success": False, "error": "message"}
```

### Key Endpoints (Planned)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | List products |
| `/api/products` | POST | Create product |
| `/api/products/:id` | PUT | Update product |
| `/api/products/:id` | DELETE | Delete product |
| `/api/sources` | GET/POST | Manage sources |
| `/api/scraper/run` | POST | Manual scrape trigger |
| `/api/prices/:productId` | GET | Price history |

---

## DEV TESTING WORKFLOW

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
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

## GITHUB WORKFLOW

```typescript
// List issues
mcp_github_list_issues({ owner: 'Conner1209', repo: 'PriceTracker', state: 'open', per_page: 30 })

// Close issue
mcp_github_update_issue({ owner: 'Conner1209', repo: 'PriceTracker', issue_number: X, state: 'closed' })
```

---

## CURRENT STATUS

**Phase: Implementation**
- [x] Backend Scaffolding
- [x] Products CRUD (`/api/products`)
- [x] Sources CRUD (`/api/sources`)
- [x] Connect Frontend to Backend (Issue #3)
- [x] Scraper Engine Implementation (Issue #4)

---

<!-- END OF AI CONTEXT DOCUMENT -->
