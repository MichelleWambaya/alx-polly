// Simple in-memory cache for API responses
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Delete cache entries that match a pattern
  deletePattern(pattern: string) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiCache = new SimpleCache()

// Cache key generators
export const cacheKeys = {
  polls: (page: number = 0, limit: number = 10) => `polls:${page}:${limit}`,
  poll: (id: string) => `poll:${id}`,
  userVote: (pollId: string, userId: string) => `vote:${pollId}:${userId}`,
  profile: (userId: string) => `profile:${userId}`
}

// Cache invalidation helpers
export const invalidateCache = {
  polls: () => apiCache.deletePattern('^polls:'),
  poll: (id: string) => apiCache.delete(`poll:${id}`),
  userVotes: (pollId: string) => apiCache.deletePattern(`^vote:${pollId}:`),
  all: () => apiCache.clear()
}
