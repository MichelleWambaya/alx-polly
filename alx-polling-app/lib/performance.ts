// Performance monitoring utilities for the polling app
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing a performance metric
  startTiming(label: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      this.metrics.get(label)!.push(duration)
      
      // Log slow operations (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  // Get average time for a metric
  getAverageTime(label: string): number {
    const times = this.metrics.get(label)
    if (!times || times.length === 0) return 0
    
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  // Get all metrics
  getAllMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {}
    
    for (const [label, times] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length,
        latest: times[times.length - 1] || 0
      }
    }
    
    return result
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear()
  }

  // Log performance summary
  logSummary(): void {
    const metrics = this.getAllMetrics()
    // Performance logging disabled in production
    // console.group('Performance Summary')
    // for (const [label, data] of Object.entries(metrics)) {
    //   console.log(`${label}: avg ${data.average.toFixed(2)}ms (${data.count} calls)`)
    // }
    // console.groupEnd()
  }
}

// Hook for measuring component render times
export function usePerformanceMonitor(label: string) {
  const monitor = PerformanceMonitor.getInstance()
  
  return {
    measure: (fn: () => void) => {
      const endTiming = monitor.startTiming(label)
      fn()
      endTiming()
    },
    measureAsync: async (fn: () => Promise<void>) => {
      const endTiming = monitor.startTiming(label)
      await fn()
      endTiming()
    }
  }
}

// Utility for measuring API calls
export async function measureApiCall<T>(
  label: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance()
  const endTiming = monitor.startTiming(`API: ${label}`)
  
  try {
    const result = await apiCall()
    return result
  } finally {
    endTiming()
  }
}

// Utility for measuring database queries
export async function measureDbQuery<T>(
  label: string,
  query: () => Promise<T>
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance()
  const endTiming = monitor.startTiming(`DB: ${label}`)
  
  try {
    const result = await query()
    return result
  } finally {
    endTiming()
  }
}
