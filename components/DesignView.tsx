
import React, { useState } from 'react';
import { Product, Source, IdentifierType } from '../types';

interface DesignViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
}

const DesignView: React.FC<DesignViewProps> = ({ products, setProducts, sources, setSources }) => {
  const [newProductName, setNewProductName] = useState('');
  const [newIdentifierValue, setNewIdentifierValue] = useState('');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('EAN');

  const addProduct = () => {
    if (!newProductName || !newIdentifierValue) return;
    const newId = Math.random().toString(36).substr(2, 9);
    setProducts([...products, { 
      id: newId, 
      name: newProductName, 
      identifierType: identifierType, 
      identifierValue: newIdentifierValue 
    }]);
    setNewProductName('');
    setNewIdentifierValue('');
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setSources(sources.filter(s => s.productId !== id));
  };

  const identifierOptions: IdentifierType[] = ['EAN', 'UPC', 'ASIN', 'MPN', 'SKU'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-plus-circle text-indigo-500"></i>
          Add New Product to Track
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Product Name"
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <select 
              className="border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
              value={identifierType}
              onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
            >
              {identifierOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={`${identifierType} Code`}
              className="flex-grow border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              value={newIdentifierValue}
              onChange={(e) => setNewIdentifierValue(e.target.value)}
            />
          </div>
          <button
            onClick={addProduct}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-bold"
          >
            Add Product
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          <i className="fas fa-info-circle mr-1"></i>
          Tip: Use <b>EAN</b> or <b>UPC</b> for better cross-store reliability. <b>ASIN</b> is best for Amazon.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <i className="fas fa-list-ul"></i>
          Current Inventory
        </h3>
        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No products added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black w-10 text-center">
                    {p.identifierType}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{p.name}</h4>
                    <p className="text-sm text-gray-500 font-mono">{p.identifierValue}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeProduct(p.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignView;
