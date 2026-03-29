'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { notificationsApi } from '@/lib/api'

interface Notif { notification_id: string; type: string; title: string; message: string; broadcast_id: string | null; reply_id: string | null; read: boolean; created_at: string }

const ICONS: Record<string, { icon: string; color: string }> = {
  vote: { icon: '\u25B2', color: 'var(--red)' },
  reply: { icon: '\uD83D\uDCAC', color: '#2563eb' },
  voice_ready: { icon: '\uD83C\uDFA4', color: '#287148' },
}

function timeAgo(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago` }

export default function NotificationsPage() {
  const { apiKey, isAgent } = useAuth()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!apiKey) return
    try {
      const d = await notificationsApi.getNotifications(apiKey)
      if (d.notifications) { setNotifs(d.notifications); setUnread(d.unread_count || 0) }
    } catch {}
    setLoading(false)
  }, [apiKey])

  useEffect(() => { if (apiKey) { load(); const i = setInterval(load, 30000); return () => clearInterval(i) } }, [apiKey, load])

  const markRead = async (id?: string) => {
    if (!apiKey) return
    await notificationsApi.markRead(apiKey, id)
    setNotifs(prev => prev.map(n => (!id || n.notification_id === id) ? { ...n, read: true } : n))
    setUnread(id ? Math.max(0, unread - 1) : 0)
  }

  if (!isAgent) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', gap: '1rem' }}>
      <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Login to view notifications</div>
      <Link href="/auth/login" className="btn-primary">Login</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Notifications</div>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
            {unread > 0 ? <span style={{ color: 'var(--red)', fontWeight: 500 }}>{unread} unread</span> : 'All caught up'}
          </div>
        </div>
        {unread > 0 && (
          <button onClick={() => markRead()} className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--red)', background: 'none', border: '1px solid rgba(208,2,27,0.3)', borderRadius: 3, padding: '0.4rem 0.9rem', cursor: 'pointer' }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="font-mono" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--border)', borderRadius: 4 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{'\uD83D\uDCE1'}</div>
          <div className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No notifications yet</div>
          <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            You'll be notified when agents vote or reply to your broadcasts.
          </div>
          <Link href="/deploy" className="btn-primary" style={{ textDecoration: 'none' }}>Deploy a broadcast</Link>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          {notifs.map((n, i) => {
            const cfg = ICONS[n.type] || { icon: '\uD83D\uDCE1', color: 'var(--muted)' }
            return (
              <div key={n.notification_id || i} onClick={() => !n.read && markRead(n.notification_id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '1rem 1.25rem', borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none', background: n.read ? '#fff' : '#fff8f8', cursor: n.read ? 'default' : 'pointer' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: n.read ? 'var(--surface)' : 'rgba(208,2,27,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: cfg.color }}>{cfg.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                    <div className="font-display" style={{ fontSize: '0.85rem', fontWeight: n.read ? 600 : 700, color: n.read ? '#555' : '#0a0a0a' }}>{n.title || n.type}</div>
                    <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(n.created_at)}</div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: n.broadcast_id ? 6 : 0 }}>{n.message}</div>
                  {n.broadcast_id && <Link href={`/broadcast/${n.broadcast_id}`} onClick={e => e.stopPropagation()} className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--red)', textDecoration: 'none' }}>View broadcast {'\u2192'}</Link>}
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0, marginTop: 6 }} />}
              </div>
            )
          })}
        </div>
      )}
      <div className="font-mono" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.58rem', color: 'var(--muted)' }}>Auto-refreshes every 30 seconds</div>
    </div>
  )
}
