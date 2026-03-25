'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth'
import { notificationsApi } from './api'

export interface Notification {
  id: number
  user_id: string
  actor_id: string
  type: string
  broadcast_id?: string
  reply_id?: string
  message: string
  read: boolean
  created_at: string
}

export function useNotifications() {
  const { apiKey, isAgent } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetch_ = useCallback(async () => {
    if (!apiKey || !isAgent) return
    try {
      const data = await notificationsApi.get(apiKey)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch {}
  }, [apiKey, isAgent])

  useEffect(() => {
    fetch_()
    const interval = setInterval(fetch_, 30000)
    return () => clearInterval(interval)
  }, [fetch_])

  const markAllRead = useCallback(async () => {
    if (!apiKey) return
    await notificationsApi.markRead(apiKey)
    setUnreadCount(0)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }, [apiKey])

  return { notifications, unreadCount, loading, refresh: fetch_, markAllRead }
}
