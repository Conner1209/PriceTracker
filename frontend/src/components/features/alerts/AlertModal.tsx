import React, { useState, useEffect } from 'react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (alert: { targetPrice: number; webhookUrl?: string }) => void;
    productName: string;
    storeName: string;
    currentPrice?: number;
    existingAlert?: {
        id: string;
        targetPrice: number;
        webhookUrl: string | null;
        isActive: boolean;
    };
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onSave,
    productName,
    storeName,
    currentPrice,
    existingAlert
}) => {
    const [targetPrice, setTargetPrice] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingAlert) {
            setTargetPrice(existingAlert.targetPrice.toString());
            setWebhookUrl(existingAlert.webhookUrl || '');
        } else if (currentPrice) {
            // Suggest 10% below current price
            setTargetPrice((currentPrice * 0.9).toFixed(2));
            setWebhookUrl('');
        }
    }, [existingAlert, currentPrice, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(targetPrice);
        if (isNaN(price) || price <= 0) return;

        setSaving(true);
        try {
            await onSave({
                targetPrice: price,
                webhookUrl: webhookUrl.trim() || undefined
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-bell text-indigo-600"></i>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {existingAlert ? 'Edit Alert' : 'Set Price Alert'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-bold text-gray-800">{productName}</p>
                    <p className="text-sm text-gray-500 mt-2">Source</p>
                    <p className="font-medium text-gray-700">{storeName}</p>
                    {currentPrice && (
                        <>
                            <p className="text-sm text-gray-500 mt-2">Current Price</p>
                            <p className="font-bold text-green-600 text-lg">${currentPrice.toFixed(2)}</p>
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Target Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notify me when price drops below
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Webhook URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notification URL <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="https://ntfy.sh/my-topic"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            💡 Leave blank to use default webhook
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !targetPrice}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Saving...
                                </span>
                            ) : (
                                existingAlert ? 'Update Alert' : 'Save Alert'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlertModal;
