import React, { useState, useEffect } from 'react';
import { Product, Source, IdentifierType } from '@/types';
import { api } from '@/services/api';
import AlertModal from '../alerts/AlertModal';
import AlertBadge from '../alerts/AlertBadge';

// Common store presets with their CSS selectors
const STORE_PRESETS = [
  { name: 'Custom', selector: '' },
  { name: 'Amazon', selector: '.a-price .a-offscreen' },
  { name: 'Best Buy', selector: '.priceView-customer-price span' },
  { name: 'Walmart', selector: '[itemprop="price"]' },
  { name: 'Target', selector: '[data-test="product-price"]' },
  { name: 'Newegg', selector: '.price-current' },
  { name: 'B&H Photo', selector: '[data-selenium="pricingPrice"]' },
  { name: 'Micro Center', selector: '#pricing' },
  { name: 'eBay', selector: '.x-price-primary span' },
];

interface DesignViewProps {
  products: Product[];
  onAddProduct: (product: any) => Promise<{ id: string }>;
  onRemoveProduct: (id: string) => Promise<void>;
  sources: Source[];
  onAddSource: (source: any) => Promise<void>;
  onRemoveSource: (id: string) => Promise<void>;
  onScrapeSource: (sourceId: string) => Promise<{ price: number }>;
}

const DesignView: React.FC<DesignViewProps> = ({
  products,
  onAddProduct,
  onRemoveProduct,
  sources,
  onAddSource,
  onRemoveSource,
  onScrapeSource
}) => {
  // New unified form state
  const [productUrl, setProductUrl] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newIdentifierValue, setNewIdentifierValue] = useState('');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('EAN');
  const [newStoreName, setNewStoreName] = useState('');
  const [newCssSelector, setNewCssSelector] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [urlDetected, setUrlDetected] = useState(false);

  // Source management state
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [newSource, setNewSource] = useState({ storeName: '', url: '', cssSelector: '' });

  // Scraping state: { sourceId: { loading: boolean, result: string | null, error: string | null } }
  const [scrapingStatus, setScrapingStatus] = useState<Record<string, { loading: boolean; result?: string; error?: string }>>({});

  // Alerts state
  const [alerts, setAlerts] = useState<Record<string, any[]>>({});  // keyed by sourceId
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalSource, setAlertModalSource] = useState<{ sourceId: string; productId: string; productName: string; storeName: string; currentPrice?: number } | null>(null);
  const [editingAlert, setEditingAlert] = useState<any | null>(null);

  // Fetch alerts when a product is expanded
  useEffect(() => {
    if (expandedProductId) {
      const productSources = sources.filter(s => s.productId === expandedProductId);
      productSources.forEach(async (source) => {
        try {
          const sourceAlerts = await api.alerts.list(source.id);
          setAlerts(prev => ({ ...prev, [source.id]: sourceAlerts }));
        } catch (e) {
          console.error('Failed to fetch alerts for source', source.id);
        }
      });
    }
  }, [expandedProductId, sources]);

  const handleScrapeSource = async (sourceId: string) => {
    setScrapingStatus(prev => ({ ...prev, [sourceId]: { loading: true } }));
    try {
      const result = await onScrapeSource(sourceId);
      setScrapingStatus(prev => ({
        ...prev,
        [sourceId]: { loading: false, result: `$${result.price.toFixed(2)}` }
      }));
      // Clear result after 5 seconds
      setTimeout(() => {
        setScrapingStatus(prev => {
          const { [sourceId]: _, ...rest } = prev;
          return rest;
        });
      }, 5000);
    } catch (error: any) {
      setScrapingStatus(prev => ({
        ...prev,
        [sourceId]: { loading: false, error: error.message || 'Scrape failed' }
      }));
      // Clear error after 5 seconds
      setTimeout(() => {
        setScrapingStatus(prev => {
          const { [sourceId]: _, ...rest } = prev;
          return rest;
        });
      }, 5000);
    }
  };

  const handlePresetChange = (presetName: string) => {
    const preset = STORE_PRESETS.find(p => p.name === presetName);
    if (preset) {
      if (preset.name === 'Custom') {
        setNewSource(prev => ({ ...prev, storeName: '', cssSelector: '' }));
      } else {
        setNewSource(prev => ({ ...prev, storeName: preset.name, cssSelector: preset.selector }));
      }
    }
  };

  // Handle URL paste/blur - parse and auto-fill fields
  const handleParseUrl = async () => {
    if (!productUrl.trim()) return;

    setIsParsingUrl(true);
    setParseError(null);

    try {
      const result = await api.url.parse(productUrl.trim());

      // Auto-fill detected fields
      if (result.storeName) setNewStoreName(result.storeName);
      if (result.cssSelector) setNewCssSelector(result.cssSelector);
      if (result.identifierType) setIdentifierType(result.identifierType as IdentifierType);
      if (result.identifierValue) setNewIdentifierValue(result.identifierValue);
      if (result.suggestedName) setNewProductName(result.suggestedName);

      setUrlDetected(result.detected);

      if (!result.detected) {
        setParseError('Store not recognized. Please fill in the fields manually.');
      }
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse URL');
    } finally {
      setIsParsingUrl(false);
    }
  };

  // Handle form submission - create product AND source together
  const handleAddProductWithSource = async () => {
    // Validate required fields
    if (!newProductName.trim()) {
      setParseError('Product name is required');
      return;
    }
    if (!productUrl.trim()) {
      setParseError('Product URL is required');
      return;
    }
    if (!newStoreName.trim() || !newCssSelector.trim()) {
      setParseError('Store name and CSS selector are required');
      return;
    }

    try {
      // Step 1: Create the product and get its ID
      const productResult = await onAddProduct({
        name: newProductName.trim(),
        identifierType,
        identifierValue: newIdentifierValue.trim() || 'N/A'
      });

      // Step 2: Create the source linked to the new product
      // productResult should be { id: string } from api.products.create
      const newProductId = productResult?.id;

      if (newProductId) {
        await onAddSource({
          storeName: newStoreName.trim(),
          url: productUrl.trim(),
          cssSelector: newCssSelector.trim(),
          productId: newProductId,
          isActive: true
        });
      } else {
        console.error('Failed to get product ID from creation result:', productResult);
        setParseError('Product created but source could not be linked. Please add source manually.');
      }

      // Reset form
      setProductUrl('');
      setNewProductName('');
      setNewIdentifierValue('');
      setIdentifierType('EAN');
      setNewStoreName('');
      setNewCssSelector('');
      setUrlDetected(false);
      setParseError(null);
    } catch (error: any) {
      setParseError(error.message || 'Failed to add product');
    }
  };

  // Legacy addProduct for backwards compatibility (without source)
  const addProduct = async () => {
    if (!newProductName || !newIdentifierValue) return;
    await onAddProduct({
      name: newProductName,
      identifierType,
      identifierValue: newIdentifierValue
    });
    setNewProductName('');
    setNewIdentifierValue('');
  };

  const handleAddSource = async (productId: string) => {
    if (!newSource.storeName || !newSource.url || !newSource.cssSelector) return;

    try {
      await onAddSource({
        storeName: newSource.storeName,
        url: newSource.url,
        cssSelector: newSource.cssSelector,
        productId,
        isActive: true
      });
      setNewSource({ storeName: '', url: '', cssSelector: '' });
    } catch (error) {
      console.error('Failed to add source:', error);
    }
  };

  const getSourcesForProduct = (productId: string) =>
    sources.filter(s => s.productId === productId);

  const getAlertsForSource = (sourceId: string) => alerts[sourceId] || [];

  const handleOpenAlertModal = (source: Source, product: Product) => {
    const status = scrapingStatus[source.id];
    const currentPrice = status?.result ? parseFloat(status.result.replace('$', '')) : undefined;
    setAlertModalSource({
      sourceId: source.id,
      productId: product.id,
      productName: product.name,
      storeName: source.storeName,
      currentPrice
    });
    setEditingAlert(null);
    setAlertModalOpen(true);
  };

  const handleEditAlert = (alert: any, source: Source, product: Product) => {
    const status = scrapingStatus[source.id];
    const currentPrice = status?.result ? parseFloat(status.result.replace('$', '')) : undefined;
    setAlertModalSource({
      sourceId: source.id,
      productId: product.id,
      productName: product.name,
      storeName: source.storeName,
      currentPrice
    });
    setEditingAlert(alert);
    setAlertModalOpen(true);
  };

  const handleSaveAlert = async (data: { targetPrice: number; webhookUrl?: string }) => {
    if (!alertModalSource) return;

    if (editingAlert) {
      // Update existing alert (also resets triggered status)
      await api.alerts.update(editingAlert.id, {
        targetPrice: data.targetPrice,
        webhookUrl: data.webhookUrl,
        isActive: true
      });
    } else {
      // Create new alert
      await api.alerts.create({
        productId: alertModalSource.productId,
        sourceId: alertModalSource.sourceId,
        targetPrice: data.targetPrice,
        webhookUrl: data.webhookUrl
      });
    }

    // Refresh alerts for this source
    const sourceAlerts = await api.alerts.list(alertModalSource.sourceId);
    setAlerts(prev => ({ ...prev, [alertModalSource.sourceId]: sourceAlerts }));
  };

  const handleDeleteAlert = async (alertId: string, sourceId: string) => {
    await api.alerts.delete(alertId);
    const sourceAlerts = await api.alerts.list(sourceId);
    setAlerts(prev => ({ ...prev, [sourceId]: sourceAlerts }));
  };

  const identifierOptions: IdentifierType[] = ['EAN', 'UPC', 'ASIN', 'MPN', 'SKU'];

  return (
    <>
      <div className="space-y-8 animate-fadeIn">
        {/* Add Product Form - Unified URL-First Design */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-plus-circle text-indigo-500"></i>
            Add New Product to Track
          </h2>

          {/* URL Input Row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-grow relative">
              <i className="fas fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Paste product URL here (e.g. Amazon, Best Buy, Walmart...)"
                className="w-full border p-2 pl-9 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                onBlur={handleParseUrl}
                onKeyDown={(e) => e.key === 'Enter' && handleParseUrl()}
              />
            </div>
            <button
              onClick={handleParseUrl}
              disabled={isParsingUrl || !productUrl.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isParsingUrl
                ? 'bg-gray-200 text-gray-400 cursor-wait'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {isParsingUrl ? (
                <><i className="fas fa-spinner fa-spin"></i> Analyzing...</>
              ) : (
                <><i className="fas fa-magic"></i> Analyze</>
              )}
            </button>
          </div>

          {/* Detection Status Banner */}
          {urlDetected && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              <i className="fas fa-check-circle text-green-600"></i>
              <span className="text-sm text-green-700">Store detected! Fields have been auto-filled. Modify if needed.</span>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-amber-600"></i>
              <span className="text-sm text-amber-700">{parseError}</span>
            </div>
          )}

          {/* Product Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Name</label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM5"
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ID Type</label>
                <select
                  className="border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold h-[42px]"
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
                >
                  {identifierOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="flex-grow">
                <label className="text-xs text-gray-500 mb-1 block">Identifier Value</label>
                <input
                  type="text"
                  placeholder={`${identifierType} Code (optional)`}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  value={newIdentifierValue}
                  onChange={(e) => setNewIdentifierValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Source Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Store Name</label>
              <input
                type="text"
                placeholder="e.g. Amazon, Best Buy"
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">CSS Selector</label>
              <input
                type="text"
                placeholder="e.g. .price-xl, .a-price .a-offscreen"
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                value={newCssSelector}
                onChange={(e) => setNewCssSelector(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAddProductWithSource}
              disabled={!newProductName.trim() || !productUrl.trim() || !newStoreName.trim() || !newCssSelector.trim()}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${!newProductName.trim() || !productUrl.trim() || !newStoreName.trim() || !newCssSelector.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
              <i className="fas fa-plus"></i>
              Add Product + Source
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            <i className="fas fa-info-circle mr-1"></i>
            Paste a URL to auto-detect store and product info. All fields are editable before submission.
          </p>
        </div>

        {/* Product List */}
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
            <div className="space-y-3">
              {products.map((p) => {
                const productSources = getSourcesForProduct(p.id);
                const isExpanded = expandedProductId === p.id;

                return (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Product Header */}
                    <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black w-10 text-center">
                          {p.identifierType}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{p.name}</h4>
                          <p className="text-sm text-gray-500 font-mono">{p.identifierValue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isExpanded
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <i className="fas fa-link text-xs"></i>
                          Sources ({productSources.length})
                          <i className={`fas fa-chevron-down text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                        </button>
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    {/* Sources Panel (Expandable) */}
                    {isExpanded && (
                      <div className="bg-gray-50 p-4 border-t border-gray-100">
                        {/* Existing Sources */}
                        {productSources.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {productSources.map(s => {
                              const status = scrapingStatus[s.id];
                              const sourceAlerts = getAlertsForSource(s.id);
                              return (
                                <div key={s.id} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                  {/* Source Header Row */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex-grow min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700 text-sm">{s.storeName}</span>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                          {s.cssSelector || 'N/A'}
                                        </span>
                                        {/* Scrape result/error display */}
                                        {status?.result && (
                                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold animate-pulse">
                                            {status.result}
                                          </span>
                                        )}
                                        {status?.error && (
                                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                            {status.error}
                                          </span>
                                        )}
                                      </div>
                                      <a
                                        href={s.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-500 hover:underline truncate block"
                                      >
                                        {s.url}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      {/* Add Alert Button */}
                                      <button
                                        onClick={() => handleOpenAlertModal(s, p)}
                                        className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
                                        title="Set price alert"
                                      >
                                        <i className="fas fa-bell"></i>
                                      </button>
                                      {/* Fetch Now Button */}
                                      <button
                                        onClick={() => handleScrapeSource(s.id)}
                                        disabled={status?.loading}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${status?.loading
                                          ? 'bg-gray-200 text-gray-400 cursor-wait'
                                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                          }`}
                                        title="Fetch current price"
                                      >
                                        {status?.loading ? (
                                          <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                          <i className="fas fa-sync-alt"></i>
                                        )}
                                      </button>
                                      {/* Delete Button */}
                                      <button
                                        onClick={() => onRemoveSource(s.id)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                      >
                                        <i className="fas fa-times-circle"></i>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Alerts for this source */}
                                  {sourceAlerts.length > 0 && (
                                    <div className="space-y-1 pl-2 border-l-2 border-indigo-100">
                                      {sourceAlerts.map(alert => (
                                        <AlertBadge
                                          key={alert.id}
                                          alert={alert}
                                          currentPrice={status?.result ? parseFloat(status.result.replace('$', '')) : undefined}
                                          onEdit={() => handleEditAlert(alert, s, p)}
                                          onDelete={() => handleDeleteAlert(alert.id, s.id)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic text-center py-2 mb-4">
                            No sources configured for this product.
                          </p>
                        )}

                        {/* Add Source Form */}
                        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-indigo-100">
                          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                            Add New Source
                          </h5>
                          <div className="flex flex-col gap-3">
                            {/* Store Preset Dropdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Store Preset</label>
                                <select
                                  className="w-full border p-2 rounded text-sm focus:border-indigo-500 outline-none bg-gray-50"
                                  onChange={(e) => handlePresetChange(e.target.value)}
                                  defaultValue="Custom"
                                >
                                  {STORE_PRESETS.map(preset => (
                                    <option key={preset.name} value={preset.name}>{preset.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Store Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Best Buy"
                                  className="w-full border p-2 rounded text-sm focus:border-indigo-500 outline-none"
                                  value={newSource.storeName}
                                  onChange={e => setNewSource({ ...newSource, storeName: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">CSS Selector</label>
                              <input
                                type="text"
                                placeholder="e.g. .price-xl"
                                className="w-full border p-2 rounded text-sm focus:border-indigo-500 outline-none font-mono"
                                value={newSource.cssSelector}
                                onChange={e => setNewSource({ ...newSource, cssSelector: e.target.value })}
                              />
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-grow">
                                <label className="text-xs text-gray-500 mb-1 block">Product URL</label>
                                <input
                                  type="text"
                                  placeholder="https://..."
                                  className="w-full border p-2 rounded text-sm focus:border-indigo-500 outline-none"
                                  value={newSource.url}
                                  onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                                />
                              </div>
                              <button
                                onClick={() => handleAddSource(p.id)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700 whitespace-nowrap self-end"
                              >
                                Add Source
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      {alertModalSource && (
        <AlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          onSave={handleSaveAlert}
          productName={alertModalSource.productName}
          storeName={alertModalSource.storeName}
          currentPrice={alertModalSource.currentPrice}
          existingAlert={editingAlert}
        />
      )}
    </>
  );
};

export default DesignView;
