import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Source } from '@/types';

export const useSources = () => {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSources = async () => {
        try {
            setLoading(true);
            const data = await api.sources.list();
            setSources(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    const addSource = async (source: any) => {
        await api.sources.create(source);
        await fetchSources();
    };

    const removeSource = async (id: string) => {
        await api.sources.delete(id);
        await fetchSources();
    };

    return { sources, loading, addSource, removeSource, refreshSources: fetchSources };
};
