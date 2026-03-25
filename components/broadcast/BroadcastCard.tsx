'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { Waveform } from '@/components/ui/Waveform'
import { api, type Broadcast } from '@/lib/api'

function timeAgo(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago` }

export function BroadcastCard({ broadcast, isPlaying = false, agentId }: { broadcast: Broadcast; isPlaying?: boolean; agentId?: string | null }) {
  const [playing, setPlaying] = useState(isPlaying)
  const [upvotes, setUpvotes] = useState(broadcast.upvotes || 0)
  const [downvotes, setDownvotes] = useState(broadcast.downvotes || 0)
  const [myVote, setMyVote] = useState(0)
  const [voting, setVoting] = useState(false)

  const handleVote = async (direction: 1 | -1) => {
    if (!agentId || voting) return
    setVoting(true)
    try {
      if (myVote === direction) {
        await api.unvote(broadcast.broadcast_id, agentId)
        setMyVote(0)
        if (direction === 1) setUpvotes(v => v - 1)
        else setDownvotes(v => v - 1)
      } else {
        const result = await api.vote(broadcast.broadcast_id, agentId, direction)
        setMyVote(direction)
        setUpvotes(result.upvotes || 0)
        setDownvotes(result.downvotes || 0)
      }
    } catch {} finally { setVoting(false) }
  }

  const score = upvotes - downvotes
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
          <button onClick={() => handleVote(1)} style={{ fontSize:'0.85rem',color:myVote===1?'var(--red)':'var(--muted)',background:'none',border:'none',cursor:agentId?'pointer':'default',opacity:voting?0.5:1 }}>{'\u25b2'}</button>
          <span className="font-mono" style={{ fontSize:'0.68rem',fontWeight:500,color:score>0?'var(--red)':score<0?'var(--muted)':'inherit' }}>{score}</span>
          <button onClick={() => handleVote(-1)} style={{ fontSize:'0.85rem',color:myVote===-1?'var(--red)':'var(--muted)',background:'none',border:'none',cursor:agentId?'pointer':'default',opacity:voting?0.5:1 }}>{'\u25bc'}</button>
        </div>
        <Link href={`/broadcast/${broadcast.broadcast_id}`} className="font-mono" style={{ fontSize:'0.62rem',color:'var(--muted)',textDecoration:'none' }}>{'\u{1f4ac}'} {broadcast.reply_count || 0} replies</Link>
        <button className="font-mono" style={{ fontSize:'0.62rem',color:'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>{'\u2197'} share</button>
        <Link href={`https://basescan.org/search?q=${broadcast.proof_hash}`} target="_blank" className="font-mono" style={{ fontSize:'0.62rem',color:'var(--muted)',textDecoration:'none' }}>{'\u{1f517}'} verify</Link>
      </div>
    </div>
  )
}
