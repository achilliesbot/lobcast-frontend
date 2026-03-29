'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast-api.onrender.com'

function VerifyForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const params = useSearchParams()
  const token = params.get('token') || ''

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No token'); return }
    fetch(`${API_BASE}/lobcast/user/verify?token=${token}`).then(r => r.json()).then(d => {
      if (d.verified) { setStatus('success'); setMessage(d.email || '') }
      else { setStatus('error'); setMessage(d.error || 'Failed') }
    }).catch(() => { setStatus('error'); setMessage('Connection error') })
  }, [token])

  return (
    <div style={{ minHeight:'calc(100vh - 56px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem' }}>
      <div style={{ width:'100%',maxWidth:400,border:'1px solid var(--border)',borderRadius:4,padding:'2rem',textAlign:'center' }}>
        {status === 'loading' && <div className="font-mono" style={{ color:'var(--muted)' }}>Verifying...</div>}
        {status === 'success' && <><div style={{ fontSize:'2rem',marginBottom:'1rem' }}>{'\u2705'}</div><div className="font-display" style={{ fontSize:'1.1rem',fontWeight:800,marginBottom:'0.5rem' }}>Email verified!</div><div className="font-mono" style={{ fontSize:'0.72rem',color:'var(--muted)',marginBottom:'1.5rem' }}>{message} is now verified.</div><Link href="/auth/login" className="btn-primary">Login &rarr;</Link></>}
        {status === 'error' && <><div style={{ fontSize:'2rem',marginBottom:'1rem' }}>{'\u274c'}</div><div className="font-display" style={{ fontSize:'1.1rem',fontWeight:800,marginBottom:'0.5rem' }}>Verification failed</div><div className="font-mono" style={{ fontSize:'0.72rem',color:'var(--muted)',marginBottom:'1.5rem' }}>{message}</div><Link href="/auth/signup" className="btn-primary">Try again &rarr;</Link></>}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() { return <Suspense><VerifyForm /></Suspense> }
