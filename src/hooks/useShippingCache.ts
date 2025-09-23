import { useState, useEffect } from 'react';
import { ShippingRate } from './useShippingRates';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ShippingCacheOptions {
  ratesCacheDuration?: number; // in milliseconds
  maxCacheSize?: number;
  enableCompression?: boolean;
}

const DEFAULT_OPTIONS: Required<ShippingCacheOptions> = {
  ratesCacheDuration: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 50,
  enableCompression: false
};

export function useShippingCache(options: ShippingCacheOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [cacheStats, setCacheStats] = useState({
    hitCount: 0,
    missCount: 0,
    totalRequests: 0
  });

  // Generate cache key for shipping rates
  const generateRatesCacheKey = (
    shipFrom: any,
    shipTo: any,
    packageInfo: any,
    servicePreferences?: string[]
  ): string => {
    const keyData = {
      from: {
        address: shipFrom?.address,
        city: shipFrom?.city,
        state: shipFrom?.state,
        zip: shipFrom?.zip,
        country: shipFrom?.country
      },
      to: {
        address: shipTo?.address,
        city: shipTo?.city,
        state: shipTo?.state,
        zip: shipTo?.zip,
        country: shipTo?.country
      },
      package: {
        weight: Math.round(packageInfo?.weight * 100) / 100, // Round to 2 decimals
        length: Math.round(packageInfo?.length * 100) / 100,
        width: Math.round(packageInfo?.width * 100) / 100,
        height: Math.round(packageInfo?.height * 100) / 100,
        unit: packageInfo?.dimensionUnit
      },
      services: servicePreferences?.sort() || []
    };

    return `rates_${btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
  };

  // Store data in cache
  const setCacheData = <T>(key: string, data: T, customTTL?: number): void => {
    try {
      const ttl = customTTL || config.ratesCacheDuration;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      // Check cache size and cleanup if necessary
      const cache = getCacheStorage();
      const cacheKeys = Object.keys(cache);
      
      if (cacheKeys.length >= config.maxCacheSize) {
        // Remove oldest entries
        const sortedKeys = cacheKeys
          .map(k => ({ key: k, timestamp: cache[k]?.timestamp || 0 }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, Math.floor(config.maxCacheSize * 0.2)); // Remove 20% of oldest

        sortedKeys.forEach(({ key }) => delete cache[key]);
      }

      cache[key] = entry;
      localStorage.setItem('shipping_cache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache shipping data:', error);
    }
  };

  // Get data from cache
  const getCacheData = <T>(key: string): T | null => {
    try {
      const cache = getCacheStorage();
      const entry = cache[key] as CacheEntry<T>;

      if (!entry) {
        updateCacheStats('miss');
        return null;
      }

      if (Date.now() > entry.expiresAt) {
        // Entry expired, remove it
        delete cache[key];
        localStorage.setItem('shipping_cache', JSON.stringify(cache));
        updateCacheStats('miss');
        return null;
      }

      updateCacheStats('hit');
      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached shipping data:', error);
      updateCacheStats('miss');
      return null;
    }
  };

  // Get cache storage object
  const getCacheStorage = (): Record<string, CacheEntry<any>> => {
    try {
      const cached = localStorage.getItem('shipping_cache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  };

  // Update cache statistics
  const updateCacheStats = (type: 'hit' | 'miss'): void => {
    setCacheStats(prev => ({
      hitCount: type === 'hit' ? prev.hitCount + 1 : prev.hitCount,
      missCount: type === 'miss' ? prev.missCount + 1 : prev.missCount,
      totalRequests: prev.totalRequests + 1
    }));
  };

  // Cache shipping rates
  const cacheShippingRates = (
    shipFrom: any,
    shipTo: any,
    packageInfo: any,
    rates: ShippingRate[],
    servicePreferences?: string[]
  ): void => {
    const key = generateRatesCacheKey(shipFrom, shipTo, packageInfo, servicePreferences);
    setCacheData(key, rates);
  };

  // Get cached shipping rates
  const getCachedShippingRates = (
    shipFrom: any,
    shipTo: any,
    packageInfo: any,
    servicePreferences?: string[]
  ): ShippingRate[] | null => {
    const key = generateRatesCacheKey(shipFrom, shipTo, packageInfo, servicePreferences);
    return getCacheData<ShippingRate[]>(key);
  };

  // Check if rates are cached
  const hasValidCache = (
    shipFrom: any,
    shipTo: any,
    packageInfo: any,
    servicePreferences?: string[]
  ): boolean => {
    const cached = getCachedShippingRates(shipFrom, shipTo, packageInfo, servicePreferences);
    return cached !== null && cached.length > 0;
  };

  // Clear specific cache entry
  const clearCacheEntry = (
    shipFrom: any,
    shipTo: any,
    packageInfo: any,
    servicePreferences?: string[]
  ): void => {
    try {
      const key = generateRatesCacheKey(shipFrom, shipTo, packageInfo, servicePreferences);
      const cache = getCacheStorage();
      delete cache[key];
      localStorage.setItem('shipping_cache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to clear cache entry:', error);
    }
  };

  // Clear all cache
  const clearAllCache = (): void => {
    try {
      localStorage.removeItem('shipping_cache');
      setCacheStats({ hitCount: 0, missCount: 0, totalRequests: 0 });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  };

  // Clean expired entries
  const cleanExpiredCache = (): void => {
    try {
      const cache = getCacheStorage();
      const now = Date.now();
      let cleaned = 0;

      Object.keys(cache).forEach(key => {
        if (cache[key]?.expiresAt < now) {
          delete cache[key];
          cleaned++;
        }
      });

      if (cleaned > 0) {
        localStorage.setItem('shipping_cache', JSON.stringify(cache));
        console.log(`Cleaned ${cleaned} expired cache entries`);
      }
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  };

  // Get cache statistics
  const getCacheStats = () => {
    const hitRate = cacheStats.totalRequests > 0 
      ? (cacheStats.hitCount / cacheStats.totalRequests * 100).toFixed(1)
      : '0';

    return {
      ...cacheStats,
      hitRate: `${hitRate}%`,
      cacheSize: Object.keys(getCacheStorage()).length
    };
  };

  // Clean expired entries on mount and periodically
  useEffect(() => {
    cleanExpiredCache();
    
    const interval = setInterval(cleanExpiredCache, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, []);

  return {
    cacheShippingRates,
    getCachedShippingRates,
    hasValidCache,
    clearCacheEntry,
    clearAllCache,
    getCacheStats,
    cleanExpiredCache
  };
}