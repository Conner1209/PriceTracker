import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { api } from '@/services/api';

interface PricePoint {
    id: string;
    sourceId: string;
    price: number;
    currency: string;
    fetchedAt: string;
}

interface PriceChartProps {
    sourceId: string;
    storeName: string;
    accentColor?: string;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

const PriceChart: React.FC<PriceChartProps> = ({ sourceId, storeName, accentColor = '#4f46e5' }) => {
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.prices.getHistory(sourceId);
                setPriceHistory(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load price history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [sourceId]);

    // Filter by time range
    const filteredData = React.useMemo(() => {
        if (priceHistory.length === 0) return [];

        const now = new Date();
        let cutoff = new Date();

        switch (timeRange) {
            case '7d':
                cutoff.setDate(now.getDate() - 7);
                break;
            case '30d':
                cutoff.setDate(now.getDate() - 30);
                break;
            case '90d':
                cutoff.setDate(now.getDate() - 90);
                break;
            case 'all':
            default:
                cutoff = new Date(0); // Beginning of time
        }

        return priceHistory
            .filter(p => new Date(p.fetchedAt) >= cutoff)
            .map(p => ({
                ...p,
                date: new Date(p.fetchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: new Date(p.fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                displayPrice: p.price
            }))
            .sort((a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime());
    }, [priceHistory, timeRange]);

    // Stats
    const stats = React.useMemo(() => {
        if (filteredData.length === 0) return null;

        const prices = filteredData.map(p => p.price);
        const current = prices[prices.length - 1];
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const first = prices[0];
        const change = first > 0 ? ((current - first) / first) * 100 : 0;

        return { current, min, max, avg, change };
    }, [filteredData]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-[200px] bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="text-center text-gray-500">
                    <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    if (filteredData.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h4 className="font-bold text-gray-700 mb-2">{storeName}</h4>
                <div className="text-center py-8 text-gray-400">
                    <i className="fas fa-chart-line text-4xl mb-2 opacity-30"></i>
                    <p>No price history data yet.</p>
                    <p className="text-xs mt-1">Click "Fetch Now" to scrape prices.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-gray-800">{storeName}</h4>
                    <p className="text-xs text-gray-400">{filteredData.length} data points</p>
                </div>
                {/* Time Range Selector */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-2 py-1 text-xs font-medium rounded transition-all ${timeRange === range
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {range === 'all' ? 'All' : range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            {stats && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Current</p>
                        <p className="text-lg font-bold text-gray-800">${stats.current.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Low</p>
                        <p className="text-lg font-bold text-green-600">${stats.min.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">High</p>
                        <p className="text-lg font-bold text-red-500">${stats.max.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Change</p>
                        <p className={`text-lg font-bold ${stats.change >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
                        </p>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id={`gradient-${sourceId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                padding: '12px'
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                            labelFormatter={(label, payload) => {
                                if (payload && payload[0]) {
                                    return `${label} at ${payload[0].payload.time}`;
                                }
                                return label;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="displayPrice"
                            stroke={accentColor}
                            strokeWidth={2}
                            fill={`url(#gradient-${sourceId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceChart;
