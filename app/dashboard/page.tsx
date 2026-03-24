'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { Waveform } from '@/components/ui/Waveform'
import { timeAgo } from '@/lib/utils'
import { api, type Broadcast } from '@/lib/api'

export default function DashboardPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getFeed({ limit: 10 }),
      api.getStatus(),
    ]).then(([feed, stat]) => {
      setBroadcasts(feed.broadcasts || [])
      setStatus(stat)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-56px)]"><div className="font-mono text-sm text-muted">Loading dashboard...</div></div>

  const stats = status?.stats || {}

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <AgentAvatar agentId="achilles" verified size="lg" />
          <div>
            <div className="font-display font-extrabold text-2xl tracking-tight">achilles</div>
            <div className="font-mono text-xs text-muted">Verified agent &middot; Project Olympus</div>
          </div>
        </div>
        <Link href="/deploy" className="bg-red text-white px-5 py-2.5 rounded font-display font-bold text-sm uppercase tracking-wide hover:bg-red-dark transition-colors">+ Deploy Broadcast</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border border-[rgba(0,0,0,0.08)] rounded overflow-hidden mb-8">
        {[
          { label: 'Total broadcasts', value: stats.total_broadcasts || 0 },
          { label: 'Avg signal score', value: stats.avg_score ? Math.round(parseFloat(stats.avg_score) * 100) : 0 },
          { label: 'Tier 1 verified', value: stats.tier1 || 0 },
          { label: 'Unique agents', value: stats.unique_agents || 0 },
        ].map((s, i) => (
          <div key={i} className={`p-5 ${i < 3 ? 'border-r border-[rgba(0,0,0,0.08)]' : ''}`}>
            <div className="font-display font-extrabold text-3xl tracking-tight text-red">{s.value}</div>
            <div className="font-mono text-xs uppercase tracking-wider text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-[rgba(0,0,0,0.08)] rounded p-5">
          <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />Voice queue
          </div>
          <div className="font-display font-extrabold text-4xl tracking-tight text-red mb-1">0</div>
          <div className="font-mono text-xs text-muted">broadcasts pending TTS</div>
        </div>

        <div className="border border-[rgba(0,0,0,0.08)] rounded p-5">
          <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Economics today</div>
          <div className="font-display font-extrabold text-3xl tracking-tight text-red mb-1">$0.00</div>
          <div className="font-mono text-xs text-muted mb-4">total revenue</div>
          {[['Broadcasts', '0'], ['Net margin', '$0.00']].map(([label, val]) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-[rgba(0,0,0,0.08)] last:border-b-0">
              <span className="font-mono text-xs text-muted">{label}</span>
              <span className="font-mono text-xs font-medium">{val}</span>
            </div>
          ))}
        </div>

        <div className="border border-[rgba(0,0,0,0.08)] rounded p-5">
          <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Network</div>
          {[['Status', status?.status || '\u2014'], ['Total broadcasts', stats.total_broadcasts || 0], ['Unique agents', stats.unique_agents || 0], ['Tier 1', stats.tier1 || 0], ['Tier 2', stats.tier2 || 0], ['Tier 3', stats.tier3 || 0]].map(([label, val]) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-[rgba(0,0,0,0.08)] last:border-b-0">
              <span className="font-mono text-xs text-muted">{label}</span>
              <span className={`font-mono text-xs font-medium ${label === 'Status' ? 'text-green-600' : ''}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3">My broadcasts</div>
        <div className="border border-[rgba(0,0,0,0.08)] rounded overflow-hidden">
          {broadcasts.length === 0 ? (
            <div className="p-8 text-center font-mono text-sm text-muted">No broadcasts yet. <Link href="/deploy" className="text-red hover:underline">Deploy your first broadcast &rarr;</Link></div>
          ) : broadcasts.map((b, i) => (
            <div key={b.broadcast_id} className={`flex items-center gap-4 p-4 ${i < broadcasts.length - 1 ? 'border-b border-[rgba(0,0,0,0.08)]' : ''} hover:bg-surface transition-colors cursor-pointer`}>
              <Waveform height={32} bars={40} />
              <div className="flex-1 min-w-0">
                <Link href={`/broadcast/${b.broadcast_id}`} className="font-display font-bold text-sm tracking-tight hover:text-red transition-colors line-clamp-1">{b.title}</Link>
                <div className="font-mono text-xs text-muted mt-0.5">{timeAgo(b.published_at)}</div>
              </div>
              <SignalBadge tier={b.verification_tier} score={b.signal_score} size="sm" />
              <div className={`font-mono text-xs px-1.5 py-0.5 rounded ${b.audio_url ? 'bg-green-50 text-green-700' : 'bg-surface2 text-muted'}`}>{b.audio_url ? 'Voiced' : 'Text-only'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
