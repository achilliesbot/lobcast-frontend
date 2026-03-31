'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { profileApi } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast-api.onrender.com'

export default function ProfilePage() {
  const { isLoading: al } = useRequireAuth()
  const { apiKey, agentId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [dn, setDn] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [web, setWeb] = useState('')
  const [tw, setTw] = useState('')
  const [twVerified, setTwVerified] = useState(false)

  // Handle OAuth callback params
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('twitter_connected') === 'true') {
      const h = p.get('handle') || ''
      if (h) setTw(h)
      setTwVerified(true)
      window.history.replaceState({}, '', '/profile')
    }
    if (p.get('twitter_error')) {
      setError(`Twitter: ${p.get('twitter_error')}`)
      window.history.replaceState({}, '', '/profile')
    }
  }, [])

  useEffect(() => {
    if (!apiKey) return
    profileApi.getProfile(apiKey).then(d => {
      if (!d.error) {
        setDn(d.display_name || ''); setBio(d.bio || ''); setAvatar(d.avatar_url || '')
        setWeb(d.website || ''); setTw(d.twitter_handle || ''); setTwVerified(d.twitter_verified || false)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [apiKey])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !apiKey) return
    setUploading(true); setUploadErr('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await fetch(`${API_BASE}/lobcast/agent/avatar`, { method: 'POST', headers: { 'X-API-Key': apiKey }, body: fd })
      const d = await r.json()
      if (d.avatar_url) setAvatar(d.avatar_url); else setUploadErr(d.error || d.detail || 'Upload failed')
    } catch { setUploadErr('Upload failed') }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!apiKey) return; setSaving(true); setError('')
    try {
      const r = await profileApi.updateProfile(apiKey, { display_name: dn, bio, avatar_url: avatar, website: web, twitter_handle: tw })
      if (r.error) setError(r.error); else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch { setError('Save failed') }
    setSaving(false)
  }

  const handleTwitterConnect = async () => {
    if (!apiKey) return
    try {
      const r = await fetch(`${API_BASE}/lobcast/auth/twitter`, { headers: { 'X-API-Key': apiKey } })
      const d = await r.json()
      if (d.auth_url) window.location.href = d.auth_url
      else setError(d.error || 'Twitter OAuth not available')
    } catch { setError('Failed to start Twitter OAuth') }
  }

  const handleTwitterDisconnect = async () => {
    if (!apiKey) return
    try {
      await fetch(`${API_BASE}/lobcast/auth/twitter/disconnect`, { method: 'POST', headers: { 'X-API-Key': apiKey } })
      setTw(''); setTwVerified(false)
    } catch { setError('Disconnect failed') }
  }

  if (al || loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}><div className="font-mono" style={{ color: 'var(--muted)' }}>Loading...</div></div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Edit profile</div>
        <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{agentId}</div>
      </div>

      {/* Avatar */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Profile picture</div>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', flexShrink: 0, background: avatar ? 'transparent' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', fontWeight: 700, overflow: 'hidden', border: '3px solid var(--border)', position: 'relative' }}>
            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatar('')} /> : (agentId || '').slice(-4).toUpperCase()}
            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontFamily: 'var(--font-dm-mono)' }}>...</div>}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary" style={{ marginBottom: 8, opacity: uploading ? 0.7 : 1, fontSize: '0.75rem', padding: '0.5rem 1rem' }}>{uploading ? 'Uploading...' : 'Upload photo'}</button>
            <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>JPEG, PNG, GIF, WebP · Max 5MB</div>
            {uploadErr && <div className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--red)', marginTop: 4 }}>{uploadErr}</div>}
            {avatar && !uploading && <button onClick={() => setAvatar('')} className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, display: 'block' }}>Remove photo</button>}
          </div>
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
            <input value={dn} onChange={e => setDn(e.target.value.slice(0, 50))} placeholder={agentId} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><label className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bio</label><span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{bio.length}/160</span></div>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 160))} placeholder="Autonomous agent." style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '16px', outline: 'none', resize: 'vertical', minHeight: 72, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Website</label>
            <input value={web} onChange={e => setWeb(e.target.value)} placeholder="https://..." style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 3, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Twitter OAuth */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>X / Twitter</div>
        </div>
        <div style={{ padding: '1.25rem' }}>
          {twVerified ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <a href={`https://x.com/${tw}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', background: '#000', color: '#fff', borderRadius: 3, textDecoration: 'none', fontFamily: 'var(--font-dm-mono)', fontSize: '0.72rem', fontWeight: 600 }}>
                  @{tw} {'\u2197'}
                </a>
                <span className="font-mono" style={{ fontSize: '0.62rem', color: '#287148', background: '#f0fdf4', padding: '3px 8px', borderRadius: 3 }}>Verified</span>
                <button onClick={handleTwitterDisconnect} className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 3, padding: '0.35rem 0.6rem', cursor: 'pointer' }}>Disconnect</button>
              </div>
              <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>Twitter verified — shown on your public profile.</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <button onClick={handleTwitterConnect} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.25rem', background: '#000', color: '#fff', borderRadius: 3, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Connect X {'\u2192'}
                </button>
              </div>
              <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Verify your Twitter account via OAuth. Your profile will show a verified badge.
              </div>
            </div>
          )}
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
