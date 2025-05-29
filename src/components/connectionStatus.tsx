// components/ConnectionStatus.tsx - Connection status indicator component (continued)
import React, { useState } from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

interface ConnectionStatusProps {
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
    showDetails?: boolean;
    autoHide?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    position = 'top-right',
    showDetails = false,
    autoHide = true
}) => {
    const [status, actions] = useConnectionStatus();
    const [showDetailPanel, setShowDetailPanel] = useState(showDetails);
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Auto-hide when connection is good
    if (autoHide && status.systemHealth === 'good' && !showDetailPanel) {
        return null;
    }

    const getStatusColor = () => {
        switch (status.systemHealth) {
            case 'good': return 'bg-green-500';
            case 'degraded': return 'bg-yellow-500';
            case 'down': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        if (!status.isOnline) return 'Offline';
        if (!status.dbConnected) return 'Database Disconnected';
        if (status.systemHealth === 'degraded') return 'Connection Issues';
        return 'Connected';
    };

    const getPositionClasses = () => {
        switch (position) {
            case 'top-right': return 'top-4 right-4';
            case 'bottom-right': return 'bottom-4 right-4';
            case 'top-left': return 'top-4 left-4';
            case 'bottom-left': return 'bottom-4 left-4';
            default: return 'top-4 right-4';
        }
    };

    const handleReconnect = async () => {
        setIsReconnecting(true);
        try {
            const success = await actions.forceReconnect();
            if (success) {
                console.log('Reconnection successful');
            } else {
                console.error('Reconnection failed');
            }
        } catch (error) {
            console.error('Reconnection error:', error);
        } finally {
            setIsReconnecting(false);
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleCheckHealth = async () => {
        await actions.checkHealth();
    };

    return (
        <div className={`fixed ${getPositionClasses()} z-50`}>
            {/* Main Status Indicator */}
            <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ${status.systemHealth === 'good'
                        ? 'bg-white border border-gray-200 hover:shadow-md'
                        : 'bg-white border-2 border-red-200 hover:shadow-xl'
                    }`}
                onClick={() => setShowDetailPanel(!showDetailPanel)}
            >
                {/* Status Dot */}
                <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status.isChecking ? 'animate-pulse' : ''
                    }`} />

                {/* Status Text */}
                <span className={`text-sm font-medium ${status.systemHealth === 'good' ? 'text-gray-700' : 'text-red-600'
                    }`}>
                    {getStatusText()}
                </span>

                {/* Dropdown Arrow */}
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDetailPanel ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Detail Panel */}
            {showDetailPanel && (
                <div className="mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64">
                    <div className="space-y-3">
                        {/* System Status */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">System Status</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span>Internet:</span>
                                    <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
                                        {status.isOnline ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Database:</span>
                                    <span className={status.dbConnected ? 'text-green-600' : 'text-red-600'}>
                                        {status.dbConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Health:</span>
                                    <span className={
                                        status.systemHealth === 'good' ? 'text-green-600' :
                                            status.systemHealth === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                                    }>
                                        {status.systemHealth === 'good' ? 'Good' :
                                            status.systemHealth === 'degraded' ? 'Degraded' : 'Down'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        {(status.consecutiveFailures > 0 || status.lastChecked) && (
                            <div className="border-t pt-3">
                                <div className="space-y-1 text-xs text-gray-600">
                                    {status.consecutiveFailures > 0 && (
                                        <div>Failures: {status.consecutiveFailures}</div>
                                    )}
                                    {status.lastChecked && (
                                        <div>
                                            Last check: {status.lastChecked.toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="border-t pt-3 space-y-2">
                            {/* Reconnect Button */}
                            {!status.dbConnected && (
                                <button
                                    onClick={handleReconnect}
                                    disabled={isReconnecting || status.isChecking}
                                    className="w-full px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded transition-colors duration-200"
                                >
                                    {isReconnecting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Reconnecting...
                                        </span>
                                    ) : (
                                        'Reconnect Database'
                                    )}
                                </button>
                            )}

                            {/* Check Health Button */}
                            <button
                                onClick={handleCheckHealth}
                                disabled={status.isChecking}
                                className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded transition-colors duration-200"
                            >
                                {status.isChecking ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Checking...
                                    </span>
                                ) : (
                                    'Check Health'
                                )}
                            </button>

                            {/* Refresh Page Button */}
                            {status.systemHealth === 'down' && (
                                <button
                                    onClick={handleRefresh}
                                    className="w-full px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors duration-200"
                                >
                                    Refresh Page
                                </button>
                            )}
                        </div>

                        {/* Help Text */}
                        {status.systemHealth !== 'good' && (
                            <div className="border-t pt-3">
                                <div className="text-xs text-gray-500">
                                    {status.systemHealth === 'down' && !status.isOnline && (
                                        <p>Check your internet connection and try again.</p>
                                    )}
                                    {status.systemHealth === 'down' && status.isOnline && !status.dbConnected && (
                                        <p>Database connection lost. The system is attempting to reconnect automatically.</p>
                                    )}
                                    {status.systemHealth === 'degraded' && (
                                        <p>Experiencing intermittent connection issues. Your requests may be slower than usual.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectionStatus;