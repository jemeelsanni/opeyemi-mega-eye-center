// hooks/useConnectionStatus.ts - Simple connection monitoring hook
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface ConnectionStatus {
  isOnline: boolean;
  dbConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  consecutiveFailures: number;
  systemHealth: 'good' | 'degraded' | 'down';
}

interface ConnectionActions {
  checkHealth: () => Promise<void>;
  forceReconnect: () => Promise<boolean>;
  clearErrors: () => void;
}

// Get base URL from your existing API client
const getBaseURL = () => {
  const isProduction = window.location.hostname !== 'localhost';
  return isProduction
    ? 'https://omec-backend.onrender.com/api'
    : 'http://localhost:5003/api';
};

export const useConnectionStatus = (): [ConnectionStatus, ConnectionActions] => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    dbConnected: true,
    isChecking: false,
    lastChecked: null,
    consecutiveFailures: 0,
    systemHealth: 'good'
  });

  const checkInProgress = useRef(false);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

  // Determine system health based on status
  const getSystemHealth = useCallback((dbConnected: boolean, failures: number): 'good' | 'degraded' | 'down' => {
    if (!navigator.onLine) return 'down';
    if (!dbConnected) return 'down';
    if (failures > 3) return 'degraded';
    if (failures > 0) return 'degraded';
    return 'good';
  }, []);

  // Check system health using direct axios calls
  const checkHealth = useCallback(async () => {
    if (checkInProgress.current) return;
    
    checkInProgress.current = true;
    setStatus(prev => ({ ...prev, isChecking: true }));

    try {
      const baseURL = getBaseURL();
      const response = await axios.get(`${baseURL}/health`, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const healthData = response.data;
      const dbConnected = healthData.database?.connected || false;
      
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        dbConnected,
        lastChecked: new Date(),
        consecutiveFailures: dbConnected ? 0 : prev.consecutiveFailures + 1,
        systemHealth: getSystemHealth(dbConnected, dbConnected ? 0 : prev.consecutiveFailures + 1),
        isChecking: false
      }));

    } catch (error) {
      console.error('Health check failed:', error);
      
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        dbConnected: false,
        lastChecked: new Date(),
        consecutiveFailures: prev.consecutiveFailures + 1,
        systemHealth: getSystemHealth(false, prev.consecutiveFailures + 1),
        isChecking: false
      }));
    } finally {
      checkInProgress.current = false;
    }
  }, [getSystemHealth]);

  // Force database reconnection
  const forceReconnect = useCallback(async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const baseURL = getBaseURL();
      const response = await axios.post(`${baseURL}/db-reconnect`, {}, { 
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = response.data;
      
      if (result.success) {
        setStatus(prev => ({
          ...prev,
          dbConnected: true,
          lastChecked: new Date(),
          consecutiveFailures: 0,
          systemHealth: 'good',
          isChecking: false
        }));
        return true;
      } else {
        setStatus(prev => ({
          ...prev,
          consecutiveFailures: prev.consecutiveFailures + 1,
          systemHealth: getSystemHealth(false, prev.consecutiveFailures + 1),
          isChecking: false
        }));
        return false;
      }
    } catch (error) {
      console.error('Force reconnect failed:', error);
      setStatus(prev => ({
        ...prev,
        consecutiveFailures: prev.consecutiveFailures + 1,
        systemHealth: getSystemHealth(false, prev.consecutiveFailures + 1),
        isChecking: false
      }));
      return false;
    }
  }, [getSystemHealth]);

  // Clear error states
  const clearErrors = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      consecutiveFailures: 0,
      systemHealth: getSystemHealth(prev.dbConnected, 0)
    }));
  }, [getSystemHealth]);

  // Set up periodic health checks
  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up interval for periodic checks
    checkInterval.current = setInterval(() => {
      // Only check if we've had failures or it's been a while since last check
      const now = Date.now();
      const lastCheck = status.lastChecked?.getTime() || 0;
      const timeSinceLastCheck = now - lastCheck;

      if (
        status.consecutiveFailures > 0 || 
        timeSinceLastCheck > 300000 || // 5 minutes
        status.systemHealth !== 'good'
      ) {
        checkHealth();
      }
    }, 60000); // Check every minute

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [checkHealth, status.consecutiveFailures, status.lastChecked, status.systemHealth]);

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkHealth(); // Check health when coming back online
    };

    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false,
        systemHealth: 'down'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  // Monitor page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible, check health
        checkHealth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkHealth]);

  return [
    status,
    {
      checkHealth,
      forceReconnect,
      clearErrors
    }
  ];
};

// Simple hook for handling API errors with automatic retry
export const useApiError = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setIsLoading(false);
      setRetryCount(0); // Reset retry count on success
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Check if this is a retryable error and we haven't exceeded max retries
      if (
        retryCount < maxRetries && 
        (errorMessage.includes('Database connection') || 
         errorMessage.includes('Service temporarily unavailable') ||
         errorMessage.includes('Network error') ||
         errorMessage.includes('timeout'))
      ) {
        console.log(`Retrying API call (attempt ${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        
        // Recursive retry
        return handleApiCall(apiCall, maxRetries);
      }

      setError(errorMessage);
      setIsLoading(false);
      setRetryCount(0);
      throw err;
    }
  }, [retryCount]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return { 
    error, 
    isLoading, 
    retryCount,
    handleApiCall, 
    clearError 
  };
};