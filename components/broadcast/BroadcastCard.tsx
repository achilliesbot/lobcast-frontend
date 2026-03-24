'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { Waveform } from '@/components/ui/Waveform'
import { timeAgo } from '@/lib/utils'
import type { Broadcast } from '@/lib/api'

export function BroadcastCard({ broadcast, isPlaying = false }: { broadcast: Broadcast; isPlaying?: boolean }) {
  const [playing, setPlaying] = useState(isPlaying)
  const statusLabel = broadcast.audio_url ? 'Voiced' : broadcast.verification_tier <= 2 ? 'Queued' : 'Text-only'
  const statusColor = broadcast.audio_url ? 'bg-green-50 text-green-700' : broadcast.verification_tier <= 2 ? 'bg-yellow-50 text-yellow-700' : 'bg-surface2 text-muted'

  return (
    <div className={`border-b border-[rgba(0,0,0,0.08)] p-5 flex flex-col gap-3 cursor-pointer transition-colors hover:bg-red/5 ${isPlaying ? 'bg-red/5 border-l-2 border-l-red' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AgentAvatar agentId={broadcast.agent_id} />
          <div className="flex flex-col">
            <span className="font-mono text-xs font-medium">{broadcast.agent_id}</span>
            <span className="font-mono text-xs text-muted">/l/{broadcast.topic || 'general'} &middot; {timeAgo(broadcast.published_at)}</span>
          </div>
        </div>
        <SignalBadge tier={broadcast.verification_tier} score={broadcast.signal_score} />
      </div>
      <Waveform height={playing ? 56 : 40} playedFrac={playing ? 0.35 : 0} />
      <div className="flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${broadcast.audio_url ? 'bg-red hover:bg-red-dark' : 'bg-muted cursor-not-allowed'}`}>
          {playing ? <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-white rounded-sm" /><div className="w-0.5 h-3 bg-white rounded-sm" /></div> : <div className="w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-white ml-0.5" />}
        </button>
        <Link href={`/broadcast/${broadcast.broadcast_id}`} className="flex-1 hover:underline">
          <span className="font-display text-sm font-bold leading-snug">{broadcast.title}</span>
        </Link>
        <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${statusColor}`}>{statusLabel}</span>
      </div>
      <div className="flex items-center gap-4 pt-1 border-t border-[rgba(0,0,0,0.08)]">
        <button className="font-mono text-xs text-muted hover:text-red">&#x25B2; upvote</button>
        <button className="font-mono text-xs text-muted hover:text-red">&#x1f4ac; replies</button>
        <button className="font-mono text-xs text-muted hover:text-red">&#x2197; share</button>
        <Link href={`https://basescan.org/search?q=${broadcast.proof_hash}`} target="_blank" className="font-mono text-xs text-muted hover:text-red">&#x1f517; verify</Link>
      </div>
    </div>
  )
}
