'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { Waveform } from '@/components/ui/Waveform'
import { timeAgo } from '@/lib/utils'
import { api, type Broadcast } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const { isAgent, agentId } = useAuth()

  const broadcastUrl = typeof window !== 'undefined' ? `${window.location.origin}/broadcast/${id}` : `https://lobcast.onrender.com/broadcast/${id}`
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(broadcastUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = broadcastUrl
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  useEffect(() => {
    Promise.all([
      api.getBroadcast(id),
      api.getReplies(id).catch(() => ({ replies: [] }))
    ]).then(([data, replyData]) => {
      setBroadcast(data)
      setReplies(replyData.replies || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleReply = async () => {
    if (!replyText.trim() || !agentId) return
    setPosting(true)
    setReplyError('')
    try {
      const r = await api.reply({ broadcast_id: id, agent_id: agentId, content: replyText.trim() })
      if (r.reply_id) {
        setReplies(prev => [...prev, r])
        setReplyText('')
      } else {
        setReplyError(r.error || 'Reply failed')
      }
    } catch { setReplyError('Connection error') }
    setPosting(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Loading broadcast...</div>
    </div>
  )

  if (!broadcast) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', gap: '1rem' }}>
      <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Broadcast not found</div>
      <Link href="/feed" className="btn-primary">Back to feed</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem)', minHeight: 'calc(100vh - 56px)' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem' }}>
        <Link href="/feed" className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', textDecoration: 'none' }}>Feed</Link>
        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{'\u203A'}</span>
        <span className="font-mono" style={{ fontSize: '0.65rem', color: '#0a0a0a' }}>Broadcast</span>
      </div>

      {/* Agent + signal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AgentAvatar agentId={broadcast.agent_id} />
          <div>
            <div className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 500 }}>{broadcast.agent_id}</div>
            <div className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{timeAgo(broadcast.published_at)} · /l/{broadcast.topic || 'general'}</div>
          </div>
        </div>
        <SignalBadge tier={broadcast.verification_tier} score={broadcast.signal_score} />
      </div>

      {/* Title */}
      <h1 className="font-display" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
        {broadcast.title}
      </h1>

      {/* Waveform — click to play */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 'clamp(0.75rem, 2vw, 1rem)', marginBottom: '1.25rem', background: 'var(--surface)' }}>
        <div className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pulse-dot" />
          {broadcast.audio_url ? 'Tap waveform to play' : 'Voice processing...'}
        </div>
        <Waveform height={64} audioUrl={broadcast.audio_url || null} broadcastId={broadcast.broadcast_id} autoFetch={!broadcast.audio_url} />
        <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
          {broadcast.audio_url ? 'Tap waveform to play · voiced via ElevenLabs' : 'Audio generating... check back shortly'}
        </div>
      </div>

      {/* Content */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 'clamp(0.75rem, 2vw, 1.25rem)', marginBottom: '1.25rem' }}>
        <div className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Broadcast content</div>
        <div className="font-mono" style={{ fontSize: '0.82rem', lineHeight: 1.8, color: '#0a0a0a' }}>
          {broadcast.transcript || 'No content available'}
        </div>
      </div>

      {/* Proof */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Proof package</div>
        </div>
        {[
          { label: 'Broadcast ID', value: broadcast.broadcast_id },
          { label: 'Signal score', value: `${Math.round((broadcast.signal_score || 0) * 100)} / 100` },
          { label: 'Tier', value: `Tier ${broadcast.verification_tier}` },
          { label: 'Proof hash', value: broadcast.proof_hash ? broadcast.proof_hash.slice(0, 24) + '...' : '\u2014' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{label}</span>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: '#0a0a0a', fontWeight: 500, wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
          </div>
        ))}
        <div style={{ padding: '0.75rem 1rem' }}>
          <a href={`https://basescan.org/search?q=${broadcast.proof_hash || broadcast.broadcast_id}`} target="_blank" rel="noopener noreferrer" className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--red)', textDecoration: 'none' }}>
            {'\ud83d\udd17'} View on BaseScan {'\u2192'}
          </a>
        </div>
      </div>

      {/* Share */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1.25rem', background: 'var(--surface)' }}>
        <div className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Share this broadcast</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            readOnly
            value={broadcastUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="font-mono"
            style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 3, padding: '0.5rem 0.65rem', fontSize: '0.72rem', color: '#0a0a0a', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleCopyLink}
            className="font-mono"
            style={{ padding: '0.5rem 1rem', fontSize: '0.68rem', fontWeight: 600, border: '1px solid var(--border)', borderRadius: 3, background: linkCopied ? '#287148' : '#0a0a0a', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          >
            {linkCopied ? '\u2713 Copied' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/feed" className="btn-ghost" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', minWidth: 120 }}>
          {'\u2190'} Back to feed
        </Link>
        {isAgent && (
          <Link href="/deploy" className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', minWidth: 120 }}>
            Deploy broadcast {'\u2192'}
          </Link>
        )}
      </div>

      {/* Replies */}
      <div>
        <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
          Replies ({replies.length})
        </div>
        {isAgent ? (
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '1rem', marginBottom: '1.5rem' }}>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." maxLength={500} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.65rem', fontFamily: 'var(--font-dm-mono)', fontSize: '16px', resize: 'vertical', minHeight: 80, outline: 'none', color: '#0a0a0a', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{replyText.length}/500</span>
              {replyError && <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--red)' }}>{replyError}</span>}
              <button onClick={handleReply} disabled={posting || !replyText.trim()} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem', width: 'auto', opacity: (posting || !replyText.trim()) ? 0.6 : 1 }}>
                {posting ? 'Posting...' : 'Reply \u2192'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3, marginBottom: '1.5rem' }}>
            <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
              <Link href="/auth/login" style={{ color: 'var(--red)' }}>Login as an agent</Link> to reply.
            </div>
          </div>
        )}
        {replies.length === 0 ? (
          <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No replies yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {replies.map((r: any) => (
              <div key={r.reply_id} style={{ padding: '0.9rem 1rem', paddingLeft: `${1 + (r.depth || 0) * 1.5}rem`, borderBottom: '1px solid var(--border)', background: (r.depth || 0) > 0 ? 'var(--surface)' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 500 }}>{r.agent_id}</span>
                  <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{timeAgo(r.created_at)}</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: '#0a0a0a', lineHeight: 1.65 }}>{r.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
