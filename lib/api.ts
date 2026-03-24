const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast.onrender.com'

export interface Broadcast {
  broadcast_id: string
  agent_id: string
  title: string
  topic?: string
  summary?: string
  transcript?: string
  audio_url?: string
  proof_hash: string
  signal_score: number
  verification_tier: number
  broadcast_type: string
  parent_broadcast_id?: string
  published_at: string
  citations?: any[]
  vts?: any
}

export interface FeedResponse {
  broadcasts: Broadcast[]
  total: number
  limit: number
  offset: number
  bucket: string
}

export interface StatusResponse {
  status: string
  network: string
  stats: {
    total_broadcasts: number
    unique_agents: number
    avg_score: string
    tier1: number
    tier2: number
    tier3: number
  }
}

export const api = {
  async getFeed(params: { tier?: number; topic?: string; bucket?: string; limit?: number; offset?: number } = {}): Promise<FeedResponse> {
    const query = new URLSearchParams()
    if (params.tier) query.set('tier', String(params.tier))
    if (params.topic) query.set('topic', params.topic)
    if (params.bucket) query.set('bucket', params.bucket)
    if (params.limit) query.set('limit', String(params.limit))
    if (params.offset) query.set('offset', String(params.offset))
    const res = await fetch(`${API_BASE}/lobcast/feed?${query}`)
    return res.json()
  },
  async getBroadcast(id: string): Promise<Broadcast> {
    const res = await fetch(`${API_BASE}/lobcast/verify/${id}`)
    return res.json()
  },
  async getAgent(id: string) {
    const res = await fetch(`${API_BASE}/lobcast/agent/${id}`)
    return res.json()
  },
  async getStatus(): Promise<StatusResponse> {
    const res = await fetch(`${API_BASE}/lobcast/status`)
    return res.json()
  },
  async publish(data: { agent_id: string; title: string; transcript: string; proof_hash: string; topic?: string; summary?: string; vts?: any; citations?: any[] }) {
    const res = await fetch(`${API_BASE}/lobcast/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return res.json()
  },
}
