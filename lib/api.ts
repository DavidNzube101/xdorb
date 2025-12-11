// Structured API service for centralized data management
// All API calls go through this layer with error handling and type safety

export interface PNodeMetrics {
  id: string
  name: string
  status: "active" | "inactive" | "warning"
  uptime: number
  latency: number
  validations: number
  rewards: number
  location: string
  region: string
  lat: number
  lng: number
  storageUsed: number
  storageCapacity: number
  lastSeen: string // ISO string
  performance: number
  stake: number
  riskScore: number
  xdnScore: number
}

export interface DashboardStats {
  totalNodes: number
  activeNodes: number
  networkHealth: number
  totalRewards: number
  averageLatency: number
  validationRate: number
  fetchTime: number
  timestamp: number
}

export interface ApiResponse<T> {
  data: T
  error: string | null
  timestamp: number
}

// Backend API endpoints
const API_BASE = "/api"

async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      cache: 'no-store', // Disable caching to ensure fresh data
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const result = await response.json()

    return {
      data: result.data as T,
      error: null,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`[v0] API fetch error on ${endpoint}:`, error)
    return {
      data: {} as T,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    }
  }
}

// Public API methods
export const apiClient = {
  // Dashboard Stats
  getDashboardStats: () => fetchFromApi<DashboardStats>("/dashboard/stats"),

  // pNode Management
  getPNodes: (filters?: { status?: string; location?: string }) =>
    fetchFromApi<PNodeMetrics[]>(`/pnodes?${new URLSearchParams(filters as Record<string, string>).toString()}`),

  refreshData: () => fetchFromApi<PNodeMetrics[]>("/pnodes/refresh", { method: "POST" }),

  getPNodeById: (id: string) => fetchFromApi<PNodeMetrics>(`/pnodes/${id}`),

  updatePNode: (id: string, data: Partial<PNodeMetrics>) =>
    fetchFromApi<PNodeMetrics>(`/pnodes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Metrics History
  getPNodeHistory: (id: string, timeRange: "24h" | "7d" | "30d" = "24h", simulated = false) =>
    fetchFromApi<Array<{ timestamp: number; latency: number; uptime: number; storageUsed: number; rewards: number }>>(
      `/pnodes/${id}/history?range=${timeRange}&simulated=${simulated}`,
    ),

  // Peer Connections
  getPNodePeers: (id: string) =>
    fetchFromApi<Array<{ id: string; name: string; status: string; latency: number }>>(
      `/pnodes/${id}/peers`,
    ),

  // Alerts
  getPNodeAlerts: (id: string) =>
    fetchFromApi<Array<{ id: string; type: string; message: string; timestamp: number; severity: "low" | "medium" | "high" }>>(
      `/pnodes/${id}/alerts`,
    ),

  // Leaderboard
  getLeaderboard: (metric: "rewards" | "uptime" | "performance" | "xdn" = "xdn", limit = 10) => {
    return fetchFromApi<PNodeMetrics[]>(`/leaderboard?metric=${metric}&limit=${limit}`)
  },

  // Network Heat Map
  getNetworkHeatmap: () => {
    return fetchFromApi<
      Array<{
        lat: number
        lng: number
        intensity: number
        nodeCount: number
        region: string
        avgUptime: number
      }>
    >("/network/heatmap")
  },

  getNetworkHistory: (timeRange: "24h" | "7d" | "30d" = "24h") =>
    fetchFromApi<Array<{ timestamp: number; latency: number; uptime: number; storageUsed: number; rewards: number }>>(
      `/network/history?range=${timeRange}`,
    ),

  getJupiterQuote: (queryString: string) =>
    fetchFromApi<any>(`/jupiter/quote?${queryString}`),

  getHistoricalPNodes: () => fetchFromApi<PNodeMetrics[]>("/pnodes/historical"),

  // Clear cache manually if needed (No-op now)
  clearCache: () => {},
}
// AI Insights using Gemini
export interface AIInsight {
  riskScore: number
  explanation: string
  summary: string
  recommendations: string[]
}

async function generateAIInsight(pnodeData: PNodeMetrics, history?: Array<{ timestamp: number; uptime: number }>): Promise<AIInsight> {
  try {
    const response = await fetch('/api/ai/insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pnodeData, history }),
    })

    if (!response.ok) {
      throw new Error('AI service error')
    }

    return await response.json()
  } catch (error) {
    console.error('AI Insight generation failed:', error)
    return {
      riskScore: 50,
      explanation: "Unable to generate AI insights at this time",
      summary: "Basic performance monitoring active",
      recommendations: ["Check system logs", "Verify network connectivity"]
    }
  }
}

// Public AI methods
export const aiClient = {
  getPNodeInsight: (pnode: PNodeMetrics, history?: Array<{ timestamp: number; uptime: number }>) =>
    generateAIInsight(pnode, history),
}

// Export cache utilities for debugging
export const cacheDebug = {
  // Removed cache utilities as cache is not used
}
