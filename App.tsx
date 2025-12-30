
import React, { useState } from 'react';
import { Tab, Product, Source } from './types';
import Header from './components/Header';
import DesignView from './components/DesignView';
import PreviewView from './components/PreviewView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Design);
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'NVIDIA RTX 4090', identifierType: 'MPN', identifierValue: 'VCG409024TFXXPB1' },
    { id: '2', name: 'Intel Core i9-14900K', identifierType: 'EAN', identifierValue: '5033033159223' }
  ]);
  const [sources, setSources] = useState<Source[]>([
    { id: 's1', productId: '1', storeName: 'TechPantry', url: 'https://example.com/p1', cssSelector: '.price' },
    { id: 's2', productId: '1', storeName: 'ByteMarket', url: 'https://example.com/p2', cssSelector: '#product-price' }
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === Tab.Design && (
          <DesignView 
            products={products} 
            setProducts={setProducts} 
            sources={sources} 
            setSources={setSources}
          />
        )}
        
        {activeTab === Tab.Preview && (
          <PreviewView products={products} sources={sources} />
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
