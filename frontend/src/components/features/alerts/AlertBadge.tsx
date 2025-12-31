import React from 'react';

interface Alert {
    id: string;
    targetPrice: number;
    isActive: boolean;
    isTriggered: boolean;
    triggeredAt: string | null;
}

interface AlertBadgeProps {
    alert: Alert;
    currentPrice?: number;
    onEdit: () => void;
    onDelete: () => void;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ alert, currentPrice, onEdit, onDelete }) => {
    const { targetPrice, isActive, isTriggered, triggeredAt } = alert;

    // Triggered state
    if (isTriggered) {
        return (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                <span className="text-lg">🎉</span>
                <div className="flex-1">
                    <span className="font-bold text-green-700">TRIGGERED!</span>
                    {currentPrice && (
                        <span className="text-green-600 ml-1">
                            Price hit ${currentPrice.toFixed(2)}
                        </span>
                    )}
                    {triggeredAt && (
                        <p className="text-xs text-green-500">
                            {new Date(triggeredAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onEdit}
                        className="text-green-500 hover:text-green-700 p-1"
                        title="Reset & edit alert"
                    >
                        <i className="fas fa-redo text-xs"></i>
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-green-500 hover:text-red-500 p-1"
                        title="Delete alert"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
        );
    }

    // Paused state
    if (!isActive) {
        return (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <i className="fas fa-pause-circle text-gray-400"></i>
                <div className="flex-1">
                    <span className="text-gray-500">Paused: Below ${targetPrice.toFixed(2)}</span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onEdit}
                        className="text-gray-400 hover:text-indigo-600 p-1"
                        title="Edit alert"
                    >
                        <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete alert"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
        );
    }

    // Active/watching state
    return (
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm">
            <i className="fas fa-bell text-indigo-500"></i>
            <div className="flex-1">
                <span className="font-medium text-indigo-700">
                    Alert: Below ${targetPrice.toFixed(2)}
                </span>
                {currentPrice && (
                    <p className="text-xs text-indigo-400">
                        Watching (current: ${currentPrice.toFixed(2)})
                    </p>
                )}
            </div>
            <div className="flex gap-1">
                <button
                    onClick={onEdit}
                    className="text-indigo-400 hover:text-indigo-600 p-1"
                    title="Edit alert"
                >
                    <i className="fas fa-edit text-xs"></i>
                </button>
                <button
                    onClick={onDelete}
                    className="text-indigo-400 hover:text-red-500 p-1"
                    title="Delete alert"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default AlertBadge;
