-- PriceTracker Database Schema
-- SQLite

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('SKU', 'EAN', 'UPC', 'ASIN', 'MPN')),
    identifier_value TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Sources table (price sources per product)
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    url TEXT NOT NULL,
    css_selector TEXT,
    json_path TEXT,  -- For ld+json parsing
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    timestamp TEXT DEFAULT (datetime('now')),
    scrape_success INTEGER DEFAULT 1,
    error_message TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_price_history_source ON price_history(source_id);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_sources_product ON sources(product_id);
