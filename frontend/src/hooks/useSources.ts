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

    return { sources, loading, refreshSources: fetchSources };
};
