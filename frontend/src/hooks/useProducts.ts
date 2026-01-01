import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Product } from '@/types';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.products.list();
            setProducts(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addProduct = async (product: any) => {
        const result = await api.products.create(product);
        await fetchProducts();
        return result; // Return { id: string } so caller can use it
    };

    const removeProduct = async (id: string) => {
        await api.products.delete(id);
        await fetchProducts();
    };

    return { products, loading, error, addProduct, removeProduct };
};
