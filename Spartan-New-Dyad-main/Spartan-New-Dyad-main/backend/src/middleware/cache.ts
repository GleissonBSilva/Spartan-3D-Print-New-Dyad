import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

export interface CacheRequest extends Request {
  cacheKey?: string;
  cacheTTL?: number;
}

// Middleware to cache GET requests
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: CacheRequest, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;
    req.cacheKey = cacheKey;
    req.cacheTTL = ttl;

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cached);
      }

      console.log(`Cache miss for ${cacheKey}`);
      
      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to cache response
      res.json = function(data: any) {
        // Cache the response
        cacheService.set(cacheKey, data, ttl).catch(err => {
          console.error('Error caching response:', err);
        });
        
        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Middleware to invalidate cache
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cacheService.delPattern(pattern);
      console.log(`Invalidated cache pattern: ${pattern}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
    next();
  };
};

// Middleware to invalidate user-specific cache
export const invalidateUserCache = (userIdExtractor: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = userIdExtractor(req);
      await cacheService.invalidateUserCache(userId);
      console.log(`Invalidated cache for user: ${userId}`);
    } catch (error) {
      console.error('Error invalidating user cache:', error);
    }
    next();
  };
};