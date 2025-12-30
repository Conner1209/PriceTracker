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
            return fetchJson<any[]>(`/sources${query}`);
        },
        create: (source: any) => fetchJson<{ id: string }>('/sources', {
            method: 'POST',
            body: JSON.stringify(source),
        }),
        delete: (id: string) => fetchJson<void>(`/sources/${id}`, {
            method: 'DELETE',
        }),
    }
};
