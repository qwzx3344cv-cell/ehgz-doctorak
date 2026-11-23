import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isWeakNetwork, queuedBookingsCount } = useOnlineStatus();

  if (isOnline && !isWeakNetwork && queuedBookingsCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400/40 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[90vw]"
      dir="rtl"
    >
      {!isOnline || isWeakNetwork ? (
        <WifiOff className="w-4 h-4 text-amber-100 shrink-0" />
      ) : (
        <RefreshCw className="w-4 h-4 text-amber-100 animate-spin shrink-0" />
      )}
      <span>
        {!isOnline || isWeakNetwork
          ? 'النت ضعيف، جاري المحاولة'
          : `جاري إرسال ${queuedBookingsCount} حجز محفوظ تلقائياً...`}
        {(!isOnline || isWeakNetwork) && queuedBookingsCount > 0
          ? ` (${queuedBookingsCount} حجز محفوظ)`
          : ''}
      </span>
    </div>
  );
};
