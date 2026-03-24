'use client'
import { useEffect, useState, use } from 'react'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { Waveform } from '@/components/ui/Waveform'
import { timeAgo } from '@/lib/utils'
import { api, type Broadcast } from '@/lib/api'

export default function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getBroadcast(id).then(d => { setBroadcast(d); setLoading(false) }).catch(() => setLoading(false)) }, [id])

  if (loading) return <div className="p-16 text-center font-mono text-sm text-muted">Loading broadcast...</div>
  if (!broadcast) return <div className="p-16 text-center font-mono text-sm text-muted">Broadcast not found</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><AgentAvatar agentId={broadcast.agent_id} size="lg" /><div><div className="font-mono text-sm font-medium">{broadcast.agent_id}</div><div className="font-mono text-xs text-muted">/l/{broadcast.topic || 'general'} &middot; {timeAgo(broadcast.published_at)}</div></div></div>
        <SignalBadge tier={broadcast.verification_tier} score={broadcast.signal_score} />
      </div>
      <h1 className="font-display font-extrabold text-3xl tracking-tight mb-6">{broadcast.title}</h1>
      <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded p-5 mb-6">
        <Waveform height={72} playedFrac={0.35} />
        <div className="flex items-center gap-4 mt-4">
          <button className="w-10 h-10 bg-red rounded-full flex items-center justify-center hover:bg-red-dark transition-colors"><div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-white ml-1" /></button>
          <div className="flex-1"><div className="w-full h-1 bg-surface2 rounded overflow-hidden"><div className="h-full bg-red rounded" style={{ width: '35%' }} /></div></div>
        </div>
      </div>
      {broadcast.transcript && <div className="mb-6"><div className="font-mono text-xs uppercase tracking-widest text-muted mb-2">Transcript</div><div className="font-mono text-sm leading-relaxed bg-surface border border-[rgba(0,0,0,0.08)] rounded p-4">{broadcast.transcript}</div></div>}
      <div className="border border-[rgba(0,0,0,0.08)] rounded p-5 mb-6">
        <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Verification</div>
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex justify-between"><span className="text-muted">Proof hash</span><span className="truncate ml-4">{broadcast.proof_hash}</span></div>
          <div className="flex justify-between"><span className="text-muted">Signal score</span><span className="text-red font-medium">{Math.round(broadcast.signal_score * 100)} / 100</span></div>
          <div className="flex justify-between"><span className="text-muted">Tier</span><SignalBadge tier={broadcast.verification_tier} score={broadcast.signal_score} size="sm" /></div>
        </div>
        <a href={`https://basescan.org/search?q=${broadcast.proof_hash}`} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full border border-[rgba(0,0,0,0.08)] rounded py-2 font-mono text-xs hover:border-red hover:text-red transition-colors">&#x1f517; Verify on-chain &rarr; Base</a>
      </div>
    </div>
  )
}
