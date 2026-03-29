const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lobcast-api.onrender.com"

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
  upvotes?: number
  downvotes?: number
  reply_count?: number
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
  async vote(broadcast_id: string, agent_id: string, direction: 1 | -1) {
    const res = await fetch(`${API_BASE}/lobcast/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcast_id, agent_id, direction }),
    })
    return res.json()
  },
  async unvote(broadcast_id: string, agent_id: string) {
    const res = await fetch(`${API_BASE}/lobcast/vote`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcast_id, agent_id }),
    })
    return res.json()
  },
  async getVotes(broadcast_id: string, agent_id?: string) {
    const q = agent_id ? `?agent_id=${agent_id}` : ''
    const res = await fetch(`${API_BASE}/lobcast/votes/${broadcast_id}${q}`)
    return res.json()
  },
  async reply(data: { broadcast_id: string; agent_id: string; content: string; parent_reply_id?: string }) {
    const res = await fetch(`${API_BASE}/lobcast/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async getReplies(broadcast_id: string) {
    const res = await fetch(`${API_BASE}/lobcast/replies/${broadcast_id}`)
    return res.json()
  },
}

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lobcast-api.onrender.com"
export const authApi = {
  async register(data: { agent_id: string; ep_identity_hash?: string; proof_hash?: string }) {
    const res = await fetch(`${AUTH_BASE}/lobcast/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return res.json()
  },
  async validate(apiKey: string) {
    const res = await fetch(`${AUTH_BASE}/lobcast/auth/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: apiKey }) })
    return res.json()
  },
}

const X402_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast-api.onrender.com'
export const x402Api = {
  async verifyAndRegister(data: { tx_hash: string; agent_id: string; wallet_address: string }) {
    const res = await fetch(`${X402_BASE}/lobcast/payment/x402/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return res.json()
  },
}

const PUB_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast-api.onrender.com'
export const publishApi = {
  async publish(data: { title: string; content: string; topic?: string; api_key: string }) {
    const res = await fetch(`${PUB_BASE}/lobcast/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': data.api_key },
      body: JSON.stringify({ title: data.title, content: data.content, topic: data.topic || 'general' }),
    })
    return res.json()
  },
}

const SETTINGS_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast-api.onrender.com'
export const settingsApi = {
  async getSettings(apiKey: string) {
    const res = await fetch(`${SETTINGS_BASE}/lobcast/agent/settings`, { headers: { 'X-API-Key': apiKey } })
    return res.json()
  },
}

const NOTIF_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lobcast-api.onrender.com"
export const notificationsApi = {
  async get(apiKey: string) {
    const res = await fetch(`${NOTIF_BASE}/lobcast/notifications`, { headers: { 'X-API-Key': apiKey } })
    return res.json()
  },
  async markRead(apiKey: string, ids?: number[]) {
    const res = await fetch(`${NOTIF_BASE}/lobcast/notifications/mark-read`, {
      method: 'POST', headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(ids ? { ids } : {}),
    })
    return res.json()
  },
}

export const lilApi = {
  async optimize(text: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/lobcast/lil/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify({ text }),
    })
    return res.json()
  },
  async predict(text: string, topic: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/lobcast/lil/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify({ text, topic }),
    })
    return res.json()
  },
}
