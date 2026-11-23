import React, { useEffect, useRef, useState } from 'react';
import { reportWeakNetwork } from '../utils/localCache';

// In-memory cache of URLs that finished loading in this session
// so scrolling back or changing filters displays them instantaneously.
const loadedImageCache = new Set<string>();

interface ProgressiveLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onFatalError?: () => void;
  eager?: boolean;
}

export const ProgressiveLazyImage: React.FC<ProgressiveLazyImageProps> = ({
  src,
  alt,
  className = 'w-full h-auto object-contain block select-none',
  containerClassName = 'relative w-full bg-white overflow-hidden',
  onFatalError,
  eager = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState<boolean>(
    () => eager || loadedImageCache.has(src)
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(() => loadedImageCache.has(src));
  const [retryCount, setRetryCount] = useState<number>(0);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    const alreadyCached = loadedImageCache.has(src);
    setIsLoaded(alreadyCached);
    setHasFailed(false);
    setRetryCount(0);
    if (eager || alreadyCached) {
      setShouldLoad(true);
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: '300px 0px',
        threshold: 0.01
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [src, eager]);

  const handleLoad = () => {
    loadedImageCache.add(src);
    setIsLoaded(true);
    setHasFailed(false);
  };

  const handleError = () => {
    // Automatically retry transient network errors up to 2 times
    if (retryCount < 2 && (typeof navigator === 'undefined' || navigator.onLine)) {
      reportWeakNetwork(true);
      const delay = (retryCount + 1) * 1500;
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, delay);
      return;
    }

    setHasFailed(true);
    if (onFatalError) {
      onFatalError();
    }
  };

  if (hasFailed) {
    return null;
  }

  // Append retry cache-buster only on genuine retry attempts for remote HTTP(S) URLs
  const resolvedSrc =
    retryCount > 0 && src.startsWith('http')
      ? `${src}${src.includes('?') ? '&' : '?'}_r=${retryCount}`
      : src;

  return (
    <div ref={containerRef} className={containerClassName}>
      {/* Lightweight low-cost placeholder before decode finishes (zero layout shift) */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="w-full min-h-[180px] bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/40 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 animate-pulse flex items-center justify-center"
        >
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            جاري تحميل الصورة...
          </span>
        </div>
      )}

      {shouldLoad && (
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        />
      )}
    </div>
  );
};
