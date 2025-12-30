
import React from 'react';
import { Product, Source } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PreviewViewProps {
  products: Product[];
  sources: Source[];
}

const MOCK_HISTORY_DATA = [
  { time: '09:00', storeA: 1599.99, storeB: 1649.00 },
  { time: '12:00', storeA: 1599.99, storeB: 1649.00 },
  { time: '15:00', storeA: 1549.99, storeB: 1649.00 },
  { time: '18:00', storeA: 1549.99, storeB: 1599.00 },
  { time: '21:00', storeA: 1549.99, storeB: 1599.00 },
  { time: '00:00', storeA: 1599.99, storeB: 1599.00 },
];

const PreviewView: React.FC<PreviewViewProps> = ({ products, sources }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PiTracker Dashboard</h2>
          <p className="text-gray-500">Live preview of your local Pi-hosted web interface</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          pi.local:5000
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 text-gray-800">Global Market Trends</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_HISTORY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="storeA" name="Store A" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="storeB" name="Store B" stroke="#9333ea" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Master Product List</h3>
              <span className="text-xs text-gray-400">Monitoring {products.length} Assets</span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Identifier</th>
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Nodes</th>
                  <th className="px-6 py-4 font-semibold text-right">Market Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-400">{p.identifierType}</span>
                        <span className="font-mono text-xs text-gray-600">{p.identifierValue}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{p.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {sources.filter(s => s.productId === p.id).map((s, i) => (
                          <div key={s.id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold" title={s.storeName}>
                            S{i + 1}
                          </div>
                        ))}
                        {sources.filter(s => s.productId === p.id).length === 0 && (
                          <span className="text-xs text-gray-400">No sources</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-green-600">$1,549.99</span>
                        <span className="text-[10px] text-green-400">↓ 2.4%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg border border-indigo-500">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <i className="fas fa-microchip"></i>
              Pi Zero 2 W Resource Monitor
            </h3>
            <div className="space-y-4 mt-6">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">CPU Load</span>
                  <span className="font-mono font-bold">12%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-indigo-300 h-1.5 rounded-full w-[12%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">RAM (SRAM)</span>
                  <span className="font-mono font-bold">156MB</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-purple-300 h-1.5 rounded-full w-[30%]"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="opacity-70">Network</span>
                <span className="font-mono text-green-400">Connected</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
              <i className="fas fa-satellite-dish text-indigo-500 text-sm"></i>
              Live Activity
            </h3>
            <div className="space-y-5">
              {products.slice(0, 3).map((p, i) => (
                <div key={i} className="flex gap-3 items-start border-l-2 border-indigo-100 pl-4 py-1 relative">
                  <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-indigo-200"></div>
                  <div className="text-xs">
                    <p className="text-gray-400 font-mono">14:0{i + 1} PM</p>
                    <p className="text-gray-700 font-medium">Scraped using <span className="text-indigo-600 font-bold">{p.identifierType}</span></p>
                    <p className="text-gray-500 truncate w-40">{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewView;
