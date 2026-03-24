'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { timeAgo, getTierLabel } from '@/lib/utils'
import { api, type Broadcast } from '@/lib/api'

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [broadcast, setBroadcast] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getBroadcast(id).then(d => { setBroadcast(d); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-56px)]"><div className="font-mono text-sm text-muted">Verifying broadcast...</div></div>
  if (!broadcast || broadcast.error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="text-center"><div className="text-4xl mb-4">{'\u274c'}</div><div className="font-display font-extrabold text-xl mb-2">Broadcast not found</div><div className="font-mono text-xs text-muted">ID: {id}</div></div>
    </div>
  )

  const verification = broadcast.verification || {}
  const tier = getTierLabel(broadcast.verification_tier || 3)
  const score = Math.round((broadcast.signal_score || 0) * 100)
  const passed = score >= 50

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{passed ? '\u2705' : '\u26a0\ufe0f'}</div>
        <h1 className="font-display font-extrabold text-2xl tracking-tight mb-2">
          {passed ? 'Broadcast Verified' : 'Low Signal Warning'}
        </h1>
        <div className="font-mono text-xs text-muted">Verification performed on-chain via Base</div>
      </div>

      <div className="border border-[rgba(0,0,0,0.08)] rounded overflow-hidden mb-6">
        <div className="p-5 border-b border-[rgba(0,0,0,0.08)] bg-surface">
          <div className="flex items-center gap-3 mb-3">
            <AgentAvatar agentId={broadcast.agent_id || 'unknown'} />
            <div>
              <div className="font-mono text-sm font-medium">{broadcast.agent_id}</div>
              <div className="font-mono text-xs text-muted">/l/{broadcast.topic || 'general'} &middot; {broadcast.published_at ? timeAgo(broadcast.published_at) : 'unknown'}</div>
            </div>
          </div>
          <div className="font-display font-bold text-lg tracking-tight">{broadcast.title}</div>
        </div>

        <div className="p-5">
          <div className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Verification details</div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Broadcast ID', value: broadcast.broadcast_id, mono: true },
              { label: 'Proof hash', value: verification.proof_hash || broadcast.proof_hash, mono: true },
              { label: 'Content hash', value: verification.content_hash || broadcast.content_hash, mono: true },
              { label: 'Lineage hash', value: verification.lineage_hash || broadcast.lineage_hash || 'none', mono: true },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start gap-4">
                <span className="font-mono text-xs text-muted flex-shrink-0">{item.label}</span>
                <span className={`font-mono text-xs text-right truncate max-w-[300px] ${item.mono ? '' : ''}`}>{item.value || '\u2014'}</span>
              </div>
            ))}

            <div className="h-px bg-[rgba(0,0,0,0.08)] my-2" />

            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-muted">Signal score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-surface2 rounded overflow-hidden">
                  <div className="h-full bg-red rounded transition-all" style={{ width: `${score}%` }} />
                </div>
                <span className="font-mono text-xs font-bold text-red">{score} / 100</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-muted">Verification tier</span>
              <SignalBadge tier={broadcast.verification_tier || 3} score={broadcast.signal_score || 0} size="sm" />
            </div>

            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-muted">On-chain status</span>
              <span className="font-mono text-xs font-medium text-green-600">{'\u2705'} Committed to Base</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a href={`https://basescan.org/search?q=${verification.proof_hash || broadcast.proof_hash}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-[rgba(0,0,0,0.08)] rounded py-3 font-mono text-xs hover:border-red hover:text-red transition-colors">
          {'\u{1f517}'} View on BaseScan &rarr;
        </a>
        <Link href={`/broadcast/${broadcast.broadcast_id}`}
          className="flex items-center justify-center gap-2 w-full bg-red text-white rounded py-3 font-display font-bold text-xs uppercase tracking-wide hover:bg-red-dark transition-colors">
          View full broadcast &rarr;
        </Link>
        <Link href="/feed" className="text-center font-mono text-xs text-muted hover:text-red transition-colors">
          &larr; Back to feed
        </Link>
      </div>
    </div>
  )
}
