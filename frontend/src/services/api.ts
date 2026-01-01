// In development, use explicit localhost. In production (Docker), nginx proxies /api/ to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Handle non-2xx responses
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const json: ApiResponse<T> = await response.json();

    if (!json.success) {
        throw new Error(json.error || 'API request failed');
    }

    return json.data as T;
}

export const api = {
    products: {
        list: () => fetchJson<any[]>('/products/'),
        create: (product: any) => fetchJson<{ id: string }>('/products/', {
            method: 'POST',
            body: JSON.stringify(product),
        }),
        delete: (id: string) => fetchJson<void>(`/products/${id}`, {
            method: 'DELETE',
        }),
    },
    sources: {
        list: (productId?: string) => {
            const query = productId ? `?productId=${productId}` : '';
            return fetchJson<any[]>(`/sources/${query}`);
        },
        create: (source: any) => fetchJson<{ id: string }>('/sources/', {
            method: 'POST',
            body: JSON.stringify(source),
        }),
        delete: (id: string) => fetchJson<void>(`/sources/${id}`, {
            method: 'DELETE',
        }),
    },
    scraper: {
        // Scrape a specific source
        scrapeSource: (sourceId: string) => fetchJson<{ price: number }>(`/scraper/test/${sourceId}`, {
            method: 'POST',
        }),
        // Scrape all active sources
        scrapeAll: () => fetchJson<{ success: number; failed: number; details: any[] }>('/scraper/run-sync', {
            method: 'POST',
        }),
    },
    prices: {
        // Get price history for a source
        getHistory: (sourceId: string) => fetchJson<Array<{
            id: string;
            sourceId: string;
            price: number;
            currency: string;
            fetchedAt: string;
        }>>(`/prices/${sourceId}`),
    },
    alerts: {
        // List alerts (optionally filtered)
        list: (sourceId?: string) => {
            const query = sourceId ? `?sourceId=${sourceId}` : '';
            return fetchJson<Array<{
                id: string;
                productId: string;
                sourceId: string;
                targetPrice: number;
                webhookUrl: string | null;
                isActive: boolean;
                isTriggered: boolean;
                createdAt: string;
                triggeredAt: string | null;
            }>>(`/alerts/${query}`);
        },
        // Create new alert
        create: (alert: {
            productId: string;
            sourceId: string;
            targetPrice: number;
            webhookUrl?: string;
        }) => fetchJson<{ id: string }>('/alerts/', {
            method: 'POST',
            body: JSON.stringify(alert),
        }),
        // Update alert
        update: (id: string, update: {
            targetPrice?: number;
            webhookUrl?: string;
            isActive?: boolean;
        }) => fetchJson<void>(`/alerts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(update),
        }),
        // Delete alert
        delete: (id: string) => fetchJson<void>(`/alerts/${id}`, {
            method: 'DELETE',
        }),
        // Get default webhook
        getDefaultWebhook: () => fetchJson<{ webhookUrl: string | null }>('/alerts/settings/webhook'),
        // Set default webhook
        setDefaultWebhook: (url: string) => fetchJson<void>('/alerts/settings/webhook', {
            method: 'PUT',
            body: JSON.stringify({ webhookUrl: url }),
        }),
    },
    url: {
        parse: (url: string, fetchTitle: boolean = true) => fetchJson<{
            url: string;
            storeName: string | null;
            cssSelector: string | null;
            identifierType: string | null;
            identifierValue: string | null;
            suggestedName: string | null;
            detected: boolean;
        }>('/url/parse', {
            method: 'POST',
            body: JSON.stringify({ url, fetchTitle }),
        }),
    },
};
