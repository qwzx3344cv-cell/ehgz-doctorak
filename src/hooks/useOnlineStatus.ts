import { useEffect, useState } from 'react';
import {
  getOfflineBookingQueue,
  getWeakNetworkFlag,
  NETWORK_HEALTH_EVENT,
  OFFLINE_QUEUE_EVENT
} from '../utils/localCache';

interface NetworkConnectionLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, cb: () => void) => void;
  removeEventListener?: (type: string, cb: () => void) => void;
}

function detectBrowserWeakConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as unknown as { connection?: NetworkConnectionLike }).connection;
  if (!conn) return false;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true;
  if (typeof conn.rtt === 'number' && conn.rtt > 900) return true;
  return false;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isWeakNetwork, setIsWeakNetwork] = useState(
    () => getWeakNetworkFlag() || detectBrowserWeakConnection()
  );
  const [queuedBookingsCount, setQueuedBookingsCount] = useState(
    () => getOfflineBookingQueue().length
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsWeakNetwork(getWeakNetworkFlag() || detectBrowserWeakConnection());
    };
    const handleOffline = () => setIsOnline(false);

    const handleHealthChange = (e: Event) => {
      const detail = (e as CustomEvent<{ isWeak?: boolean }>).detail;
      setIsWeakNetwork(Boolean(detail?.isWeak) || detectBrowserWeakConnection());
    };

    const handleQueueChange = () => {
      setQueuedBookingsCount(getOfflineBookingQueue().length);
    };

    const handleConnectionChange = () => {
      setIsWeakNetwork(getWeakNetworkFlag() || detectBrowserWeakConnection());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(NETWORK_HEALTH_EVENT, handleHealthChange);
    window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueChange);

    const conn = (navigator as unknown as { connection?: NetworkConnectionLike }).connection;
    conn?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(NETWORK_HEALTH_EVENT, handleHealthChange);
      window.removeEventListener(OFFLINE_QUEUE_EVENT, handleQueueChange);
      conn?.removeEventListener?.('change', handleConnectionChange);
    };
  }, []);

  return {
    isOnline,
    isWeakNetwork,
    queuedBookingsCount
  };
}
