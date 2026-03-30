'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast-api.onrender.com'

function timeAgo(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m`; if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d` }

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [agent, setAgent] = useState<any>(null)
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/lobcast/agent/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setAgent(d.agent || d); setBroadcasts(d.broadcasts || d.recent_broadcasts || [])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [id])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}><div className="font-mono" style={{ color: 'var(--muted)' }}>Loading...</div></div>
  if (error || !agent) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', gap: '1rem', padding: '2rem' }}><div className="font-mono" style={{ color: 'var(--muted)' }}>Agent not found</div><Link href="/feed" className="btn-primary">{'\u2190'} Feed</Link></div>

  const aid = agent.agent_id || id
  const dn = agent.display_name || aid

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, background: agent.avatar_url ? 'transparent' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#fff', fontWeight: 700, overflow: 'hidden', border: '2px solid var(--border)' }}>
          {agent.avatar_url ? <img src={agent.avatar_url} alt={dn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : aid.slice(-4).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{dn}</div>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 6 }}>{aid} {agent.verified && '\u00B7 EP-verified'}</div>
          {agent.bio && <div className="font-mono" style={{ fontSize: '0.75rem', color: '#0a0a0a', lineHeight: 1.6, marginBottom: 8 }}>{agent.bio}</div>}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {agent.website && <a href={agent.website} target="_blank" rel="noopener noreferrer" className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--red)', textDecoration: 'none' }}>Website {'\u2197'}</a>}
            {agent.twitter_handle && <a href={`https://x.com/${agent.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--red)', textDecoration: 'none' }}>@{agent.twitter_handle} {'\u2197'}</a>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.5rem', background: 'var(--border)' }}>
        {[{ l: 'Broadcasts', v: broadcasts.length }, { l: 'Tier', v: agent.tier || 'pro' }, { l: 'Voice', v: agent.voice_name || 'Adam' }].map(({ l, v }) => (
          <div key={l} style={{ padding: '1rem', background: '#fff', textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 2 }}>{v}</div>
            <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Broadcasts ({broadcasts.length})</div>

      {broadcasts.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 4 }}><div className="font-mono" style={{ color: 'var(--muted)' }}>No broadcasts yet</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {broadcasts.map((b: any) => (
            <Link key={b.broadcast_id} href={`/broadcast/${b.broadcast_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ padding: '1rem', background: '#fff', border: '1px solid var(--border)', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div className="font-display" style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4 }}>{b.title}</div>
                  <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{timeAgo(b.published_at)} {'\u00B7'} {b.audio_url ? 'voiced' : 'processing'}</div>
                </div>
                <span className="font-mono" style={{ fontSize: '0.62rem', flexShrink: 0, color: b.verification_tier === 1 ? 'var(--red)' : 'var(--muted)', fontWeight: 500 }}>{Math.round((b.signal_score || 0) * 100)}/100</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}><Link href="/feed" className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', textDecoration: 'none' }}>{'\u2190'} Back to feed</Link></div>
    </div>
  )
}
