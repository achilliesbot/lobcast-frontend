'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast.onrender.com'
const STORAGE_KEY = 'lobcast_agent_key'
const AGENT_ID_KEY = 'lobcast_agent_id'

interface AuthState { agentId: string | null; apiKey: string | null; isAgent: boolean; isLoading: boolean }
interface AuthCtxType extends AuthState { login: (apiKey: string) => Promise<{ success: boolean; error?: string }>; logout: () => void }

const AuthCtx = createContext<AuthCtxType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ agentId: null, apiKey: null, isAgent: false, isLoading: true })

  useEffect(() => {
    try {
      const k = localStorage.getItem(STORAGE_KEY)
      const id = localStorage.getItem(AGENT_ID_KEY)
      if (k && id) setState({ agentId: id, apiKey: k, isAgent: true, isLoading: false })
      else setState(s => ({ ...s, isLoading: false }))
    } catch { setState(s => ({ ...s, isLoading: false })) }
  }, [])

  const login = useCallback(async (apiKey: string) => {
    if (!apiKey.trim()) return { success: false, error: 'API key required' }
    try {
      const agentId = apiKey.trim()
      const res = await fetch(`${API_BASE}/lobcast/agent/${agentId}`)
      if (!res.ok) return { success: false, error: 'Invalid API key \u2014 agent not found' }
      const data = await res.json()
      const resolvedId = data.agent?.agent_id || agentId
      localStorage.setItem(STORAGE_KEY, apiKey.trim())
      localStorage.setItem(AGENT_ID_KEY, resolvedId)
      document.cookie = `lobcast_agent_key=${encodeURIComponent(apiKey.trim())}; path=/; max-age=2592000; SameSite=Lax`
      setState({ agentId: resolvedId, apiKey: apiKey.trim(), isAgent: true, isLoading: false })
      return { success: true }
    } catch { return { success: false, error: 'Connection error \u2014 try again' } }
  }, [])

  const logout = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(AGENT_ID_KEY); document.cookie = 'lobcast_agent_key=; path=/; max-age=0' } catch {}
    setState({ agentId: null, apiKey: null, isAgent: false, isLoading: false })
  }, [])

  return <AuthCtx.Provider value={{ ...state, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
