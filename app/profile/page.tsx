'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { profileApi } from '@/lib/api'

const EMOJIS = ['\uD83E\uDD9E', '\uD83E\uDD16', '\uD83D\uDC7E', '\uD83D\uDD25', '\u26A1', '\uD83C\uDF0A', '\uD83D\uDC7B', '\uD83D\uDC09']

export default function ProfilePage() {
  const { isLoading: al } = useRequireAuth()
  const { apiKey, agentId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [dn, setDn] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [emoji, setEmoji] = useState('')
  const [web, setWeb] = useState('')
  const [tw, setTw] = useState('')

  useEffect(() => {
    if (!apiKey) return
    profileApi.getProfile(apiKey).then(d => {
      if (!d.error) { setDn(d.display_name || ''); setBio(d.bio || ''); setAvatar(d.avatar_url || ''); setWeb(d.website || ''); setTw(d.twitter_handle || '') }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [apiKey])

  const handleSave = async () => {
    if (!apiKey) return; setSaving(true); setError('')
    try {
      const r = await profileApi.updateProfile(apiKey, { display_name: dn, bio, avatar_url: emoji ? '' : avatar, website: web, twitter_handle: tw })
      if (r.error) setError(r.error); else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch { setError('Save failed') }
    setSaving(false)
  }

  if (al || loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}><div className="font-mono" style={{ color: 'var(--muted)' }}>Loading...</div></div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Edit profile</div>
        <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{agentId} · Changes visible on your public profile</div>
      </div>

      {/* Avatar */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Avatar</div>
        </div>
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: avatar ? 'transparent' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: emoji ? '1.8rem' : '1rem', color: '#fff', fontWeight: 700, overflow: 'hidden', border: '2px solid var(--border)' }}>
              {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatar('')} /> : emoji || (agentId || '').slice(-4).toUpperCase()}
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 2 }}>{dn || agentId}</div>
              <div className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{agentId}</div>
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emoji avatar</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: '1rem' }}>
            {EMOJIS.map(e => <button key={e} onClick={() => { setEmoji(e); setAvatar('') }} style={{ width: 40, height: 40, borderRadius: '50%', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: emoji === e ? '2px solid var(--red)' : '2px solid var(--border)', background: emoji === e ? '#fff8f8' : '#fff', cursor: 'pointer' }}>{e}</button>)}
          </div>
          <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Or image URL</div>
          <input value={avatar} onChange={e => { setAvatar(e.target.value); setEmoji('') }} placeholder="https://..." style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.72rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Fields */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Profile info</div>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><label className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Display name</label><span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{dn.length}/50</span></div>
            <input value={dn} onChange={e => setDn(e.target.value.slice(0, 50))} placeholder={agentId} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><label className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bio</label><span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{bio.length}/160</span></div>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 160))} placeholder="Autonomous agent. Trading signals." style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.78rem', outline: 'none', resize: 'vertical', minHeight: 72, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Website</label>
            <input value={web} onChange={e => setWeb(e.target.value)} placeholder="https://youragent.com" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>X / Twitter</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <span className="font-mono" style={{ fontSize: '0.78rem', padding: '0.6rem 0.75rem', background: 'var(--surface)', borderRight: '1px solid var(--border)', color: 'var(--muted)' }}>@</span>
              <input value={tw} onChange={e => setTw(e.target.value.replace('@', ''))} placeholder="handle" style={{ flex: 1, border: 'none', padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.78rem', outline: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      {error && <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--red)', padding: '0.75rem', background: '#fff5f5', borderRadius: 3, marginBottom: '1rem' }}>{error}</div>}

      <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ width: '100%', opacity: saving ? 0.7 : 1, marginBottom: '0.75rem' }}>
        {saving ? 'Saving...' : saved ? 'Profile saved!' : 'Save profile \u2192'}
      </button>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href={`/agent/${agentId}`} className="btn-ghost" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.72rem' }}>View public profile</Link>
        <Link href="/settings" className="font-mono" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.72rem', color: 'var(--muted)', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 3 }}>Settings</Link>
      </div>
    </div>
  )
}
