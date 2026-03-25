'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast.onrender.com'

function TwoFAForm() {
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const params = useSearchParams()
  const token = params.get('token') || ''
  const router = useRouter()

  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/lobcast/user/2fa/setup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_token: token }) })
      .then(r => r.json()).then(d => { if (d.secret) { setSecret(d.secret); setStep('verify') } })
  }, [token])

  const handleEnable = async () => {
    if (code.length !== 6) { setError('Enter 6-digit code'); return }
    setLoading(true)
    const r = await fetch(`${API_BASE}/lobcast/user/2fa/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_token: token, totp_code: code }) }).then(r => r.json())
    setLoading(false)
    if (r.two_fa_enabled) { setBackupCodes(r.backup_codes || []); setStep('backup') }
    else setError(r.error || 'Invalid code')
  }

  return (
    <div style={{ minHeight:'calc(100vh - 56px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem' }}>
      <div style={{ width:'100%',maxWidth:440,border:'1px solid var(--border)',borderRadius:4,overflow:'hidden' }}>
        <div style={{ padding:'1.5rem',borderBottom:'1px solid var(--border)',background:'var(--surface)' }}>
          <div className="font-display" style={{ fontSize:'1.25rem',fontWeight:800 }}>Set up 2FA</div>
          <div className="font-mono" style={{ fontSize:'0.7rem',color:'var(--muted)',marginTop:4 }}>Google Authenticator &middot; Authy compatible</div>
        </div>
        {step === 'verify' && secret && (
          <div style={{ padding:'1.5rem' }}>
            <div style={{ marginBottom:'1.25rem',padding:'1rem',background:'#0a0a0a',borderRadius:4 }}>
              <div className="font-mono" style={{ fontSize:'0.58rem',color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Manual entry key</div>
              <div className="font-mono" style={{ fontSize:'0.82rem',color:'#fff',letterSpacing:'0.1em',wordBreak:'break-all' }}>{secret}</div>
              <button onClick={() => navigator.clipboard.writeText(secret)} className="font-mono" style={{ marginTop:8,fontSize:'0.6rem',color:'var(--red)',background:'none',border:'none',cursor:'pointer' }}>Copy secret</button>
            </div>
            <div className="font-mono" style={{ fontSize:'0.6rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'0.4rem' }}>Verification code</div>
            <input value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} placeholder="000000" maxLength={6} style={{ width:'100%',border:'1px solid var(--border)',borderRadius:3,padding:'0.65rem',fontFamily:'var(--font-dm-mono)',fontSize:'1.2rem',letterSpacing:'0.5rem',outline:'none',textAlign:'center',marginBottom:'0.75rem' }} />
            {error && <div className="font-mono" style={{ fontSize:'0.7rem',color:'var(--red)',marginBottom:'0.75rem' }}>{error}</div>}
            <button onClick={handleEnable} disabled={loading || code.length !== 6} className="btn-primary" style={{ width:'100%',opacity:(loading||code.length!==6)?0.6:1 }}>{loading ? 'Verifying...' : 'Enable 2FA \u2192'}</button>
          </div>
        )}
        {step === 'backup' && (
          <div style={{ padding:'1.5rem' }}>
            <div style={{ textAlign:'center',marginBottom:'1.25rem' }}><div style={{ fontSize:'1.5rem',marginBottom:6 }}>{'\u2705'}</div><div className="font-display" style={{ fontSize:'1rem',fontWeight:800 }}>2FA enabled</div></div>
            <div style={{ padding:'0.75rem',background:'#fff8f8',border:'1px solid rgba(208,2,27,0.2)',borderRadius:3,marginBottom:'1rem' }}>
              <div className="font-mono" style={{ fontSize:'0.65rem',color:'var(--red)',lineHeight:1.6 }}>{'\u26a0\ufe0f'} Save these backup codes. Each can only be used once.</div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:'1.25rem' }}>
              {backupCodes.map((c, i) => <div key={i} className="font-mono" style={{ padding:'0.4rem 0.6rem',background:'#0a0a0a',color:'#fff',borderRadius:3,fontSize:'0.72rem',letterSpacing:'0.05em' }}>{c}</div>)}
            </div>
            <button onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))} className="btn-ghost" style={{ width:'100%',marginBottom:'0.75rem' }}>Copy backup codes</button>
            <button onClick={() => router.push('/feed')} className="btn-primary" style={{ width:'100%' }}>Done &rarr;</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TwoFAPage() { return <Suspense><TwoFAForm /></Suspense> }
