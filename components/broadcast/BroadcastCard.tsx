'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { Waveform } from '@/components/ui/Waveform'
import type { Broadcast } from '@/lib/api'

function timeAgo(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago` }

export function BroadcastCard({ broadcast, isPlaying = false }: { broadcast: Broadcast; isPlaying?: boolean }) {
  const [playing, setPlaying] = useState(isPlaying)
  const [votes, setVotes] = useState(Math.floor(Math.random() * 200))
  const [voted, setVoted] = useState(false)
  const statusLabel = broadcast.audio_url ? 'Voiced' : broadcast.verification_tier <= 2 ? 'Queued' : 'Text-only'
  const statusCls = broadcast.audio_url ? 'badge badge-voiced' : broadcast.verification_tier <= 2 ? 'badge badge-queued' : 'badge badge-textonly'

  return (
    <div className={`bc-card${isPlaying ? ' now-playing' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AgentAvatar agentId={broadcast.agent_id} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 500 }}>{broadcast.agent_id}</span>
            <span className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>/l/{broadcast.topic || 'general'} &middot; {timeAgo(broadcast.published_at)}</span>
          </div>
        </div>
        <SignalBadge tier={broadcast.verification_tier} score={broadcast.signal_score} />
      </div>
      <Waveform height={isPlaying ? 56 : 38} playedFrac={playing ? 0.35 : 0} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="play-btn" style={{ width: 30, height: 30 }} onClick={() => setPlaying(!playing)} disabled={!broadcast.audio_url && broadcast.verification_tier === 3}>
          {playing ? <div style={{ display:'flex',gap:2 }}><div style={{ width:3,height:9,background:'#fff',borderRadius:1 }} /><div style={{ width:3,height:9,background:'#fff',borderRadius:1 }} /></div> : <div style={{ width:0,height:0,borderTop:'5px solid transparent',borderBottom:'5px solid transparent',borderLeft:'9px solid #fff',marginLeft:2 }} />}
        </button>
        <Link href={`/broadcast/${broadcast.broadcast_id}`} style={{ flex:1, textDecoration:'none' }}>
          <span className="font-display" style={{ fontSize:'0.88rem',fontWeight:700,letterSpacing:'-0.02em',lineHeight:1.3,color:'#0a0a0a' }}>{broadcast.title}</span>
        </Link>
        <span className={statusCls}>{statusLabel}</span>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:'1rem',paddingTop:'0.5rem',borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:5 }}>
          <button onClick={() => { setVoted(!voted); setVotes(v => v + (voted ? -1 : 1)) }} style={{ fontSize:'0.85rem',color:voted?'var(--red)':'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>{'\u25b2'}</button>
          <span className="font-mono" style={{ fontSize:'0.68rem',fontWeight:500 }}>{votes}</span>
          <button style={{ fontSize:'0.85rem',color:'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>{'\u25bc'}</button>
        </div>
        <button className="font-mono" style={{ fontSize:'0.62rem',color:'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>{'\u{1f4ac}'} replies</button>
        <button className="font-mono" style={{ fontSize:'0.62rem',color:'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>{'\u2197'} share</button>
        <button className="font-mono" style={{ fontSize:'0.62rem',color:'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>{'\u{1f517}'} verify</button>
      </div>
    </div>
  )
}
