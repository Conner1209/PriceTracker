const API_BASE_URL = 'http://localhost:8000/api';

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
        list: () => fetchJson<any[]>('/products'),
        create: (product: any) => fetchJson<{ id: string }>('/products', {
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
    }
};
