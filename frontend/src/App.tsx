import React, { useState } from 'react';
import { Tab } from '@/types';
import Header from '@/components/layout/Header';
import InventoryManager from '@/components/features/products/InventoryManager';
import Dashboard from '@/components/features/products/Dashboard';
import { useProducts } from '@/hooks/useProducts';
import { useSources } from '@/hooks/useSources';
import { api } from '@/services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Inventory);
  const { products, addProduct, removeProduct, loading: productsLoading } = useProducts();
  const { sources, addSource, removeSource, loading: sourcesLoading } = useSources();

  const isLoading = productsLoading || sourcesLoading;

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading PriceTracker...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === Tab.Inventory && (
          <InventoryManager
            products={products}
            onAddProduct={addProduct}
            onRemoveProduct={removeProduct}
            sources={sources}
            onAddSource={addSource}
            onRemoveSource={removeSource}
            onScrapeSource={api.scraper.scrapeSource}
          />
        )}

        {activeTab === Tab.Dashboard && (
          <Dashboard products={products} sources={sources} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          PiTracker Manager • Multi-Identifier Support Enabled
        </div>
      </footer>
    </div>
  );
};

export default App;
