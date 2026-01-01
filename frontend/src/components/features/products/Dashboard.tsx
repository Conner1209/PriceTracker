import React, { useState } from 'react';
import { Product, Source } from '@/types';
import PriceChart from '@/components/features/charts/PriceChart';

interface DashboardProps {
  products: Product[];
  sources: Source[];
}

// Color palette for charts
const CHART_COLORS = [
  '#4f46e5', // indigo
  '#9333ea', // purple
  '#0891b2', // cyan
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
];

const Dashboard: React.FC<DashboardProps> = ({ products, sources }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Get sources for the selected product
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const productSources = selectedProductId
    ? sources.filter(s => s.productId === selectedProductId)
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Price History Dashboard</h2>
          <p className="text-gray-500">View price trends and analytics for tracked products</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          {sources.length} Active Sources
        </div>
      </div>

      {/* Product Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-box text-indigo-500"></i>
          Select Product to View Charts
        </h3>

        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No products added yet. Add products in the Design tab.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map(p => {
              const productSourceCount = sources.filter(s => s.productId === p.id).length;
              const isSelected = selectedProductId === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(isSelected ? null : p.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{p.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-1">{p.identifierType}: {p.identifierValue}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${productSourceCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {productSourceCount} {productSourceCount === 1 ? 'source' : 'sources'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Charts Section */}
      {selectedProduct && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">{selectedProduct.name}</h3>
            <span className="text-sm text-gray-400">Price History Charts</span>
          </div>

          {productSources.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <i className="fas fa-link text-4xl text-gray-200 mb-4"></i>
              <p className="text-gray-500">No sources configured for this product.</p>
              <p className="text-sm text-gray-400 mt-1">Add sources in the Design tab to start tracking prices.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {productSources.map((source, index) => (
                <PriceChart
                  key={source.id}
                  sourceId={source.id}
                  storeName={source.storeName}
                  accentColor={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Cards (when no product selected) */}
      {!selectedProductId && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-box text-2xl"></i>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Total Products</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-link text-2xl"></i>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Active Sources</p>
                <p className="text-3xl font-bold">{sources.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-store text-2xl"></i>
              </div>
              <div>
                <p className="text-cyan-100 text-sm">Unique Stores</p>
                <p className="text-3xl font-bold">
                  {new Set(sources.map(s => s.storeName)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started (when no products) */}
      {products.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center">
          <i className="fas fa-chart-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Price Data Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Add products and configure sources in the Design tab to start tracking prices.
            Once you fetch some prices, charts will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
