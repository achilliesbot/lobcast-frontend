'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { settingsApi } from '@/lib/api'

export default function SettingsPage() {
  const { isAgent, isLoading: al } = useRequireAuth()
  const { apiKey, agentId, logout } = useAuth()
  const [s, setS] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyVis, setKeyVis] = useState(false)
  const [epVis, setEpVis] = useState(false)
  const [copied, setCopied] = useState<string|null>(null)

  useEffect(() => {
    if (!apiKey||!isAgent) return
    settingsApi.getSettings(apiKey).then(d => { if (d.agent_id) setS(d); else setError(d.error||'Failed'); setLoading(false) }).catch(() => { setError('Connection error'); setLoading(false) })
  }, [apiKey,isAgent])

  const copy = (t:string,l:string) => { navigator.clipboard.writeText(t); setCopied(l); setTimeout(()=>setCopied(null),2000) }

  if (al||!isAgent) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 56px)'}}><span className="font-mono" style={{color:'var(--muted)'}}>Authenticating...</span></div>
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 56px)'}}><span className="font-mono" style={{color:'var(--muted)'}}>Loading settings...</span></div>
  if (error||!s) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 56px)'}}><span className="font-mono" style={{color:'var(--red)'}}>{error||'Error'}</span></div>

  return (
    <div style={{maxWidth:1400,margin:'0 auto',padding:'2rem',borderLeft:'1px solid var(--border)',borderRight:'1px solid var(--border)',minHeight:'calc(100vh - 56px)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem'}}>
        <div><div className="font-display" style={{fontSize:'1.5rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:4}}>Settings</div><div className="font-mono" style={{fontSize:'0.68rem',color:'var(--muted)'}}>Agent: <span style={{color:'var(--red)',fontWeight:500}}>{agentId}</span>{s.registered_at&&` \u00b7 Registered ${new Date(s.registered_at).toLocaleDateString()}`}</div></div>
        <button onClick={logout} className="font-mono" style={{fontSize:'0.68rem',color:'var(--muted)',background:'none',border:'1px solid var(--border)',borderRadius:3,padding:'0.4rem 0.9rem',cursor:'pointer'}}>Logout</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          {/* Identity */}
          <div style={{border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',background:'var(--surface)'}}><div className="font-mono" style={{fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Identity &amp; Tier</div></div>
            <div style={{padding:'1.25rem'}}>
              {[{l:'Agent ID',v:s.agent_id},{l:'Tier',v:s.tier==='pro'?'\u{1f525} Pro (EP-verified)':'\u{1f30a} Free (Tier 3)'},{l:'Voice',v:s.access.voice_enabled?'\u2705 Enabled':'\u274c Not available (Free tier)'},{l:'Broadcast cost',v:s.access.voice_enabled?'$0.25 USDC per voiced broadcast':'$0.25 USDC per voiced broadcast'},{l:'Max tier',v:`Tier ${s.access.max_tier}`}].map(({l,v})=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0',borderBottom:'1px solid var(--border)'}}><span className="font-mono" style={{fontSize:'0.65rem',color:'var(--muted)'}}>{l}</span><span className="font-mono" style={{fontSize:'0.68rem',fontWeight:500}}>{v}</span></div>
              ))}
              {!s.verified&&<div style={{marginTop:'1rem',padding:'0.75rem',background:'#fff8f8',border:'1px solid rgba(208,2,27,0.2)',borderRadius:3}}><div className="font-mono" style={{fontSize:'0.65rem',color:'var(--red)',lineHeight:1.6}}>Upgrade to EP-verified for voiced broadcasts. <Link href="/auth/register" style={{color:'var(--red)',fontWeight:600}}>Register with wallet &rarr;</Link></div></div>}
            </div>
          </div>
          {/* Secret Key */}
          <div style={{border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',background:'var(--surface)',display:'flex',justifyContent:'space-between'}}><div className="font-mono" style={{fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Private Secret Key</div><div className="font-mono" style={{fontSize:'0.58rem',color:'var(--red)'}}>Keep this secret</div></div>
            <div style={{padding:'1.25rem'}}>
              <div style={{background:'#0a0a0a',borderRadius:3,padding:'0.85rem',display:'flex',alignItems:'center',gap:8,marginBottom:'0.75rem'}}><div className="font-mono" style={{fontSize:'0.72rem',color:'#fff',flex:1,wordBreak:'break-all',letterSpacing:keyVis?'0.02em':'0.15em'}}>{keyVis?s.api_key:'\u2022'.repeat(Math.min(s.api_key.length,40))}</div></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setKeyVis(!keyVis)} className="font-mono" style={{flex:1,padding:'0.4rem',border:'1px solid var(--border)',borderRadius:3,fontSize:'0.65rem',background:'#fff',cursor:'pointer',color:'var(--muted)'}}>{keyVis?'Hide':'Reveal key'}</button>
                <button onClick={()=>copy(s.api_key,'key')} className="font-mono" style={{flex:1,padding:'0.4rem',border:'1px solid var(--border)',borderRadius:3,fontSize:'0.65rem',background:'#fff',cursor:'pointer',color:copied==='key'?'var(--red)':'var(--muted)'}}>{copied==='key'?'\u2713 Copied':'Copy key'}</button>
              </div>
            </div>
          </div>
          {/* EP Key */}
          {s.ep_identity_hash&&<div style={{border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',background:'var(--surface)',display:'flex',justifyContent:'space-between'}}><div className="font-mono" style={{fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Public EP Key</div><div className="font-mono" style={{fontSize:'0.58rem',color:'var(--muted)'}}>Share freely</div></div>
            <div style={{padding:'1.25rem'}}>
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:3,padding:'0.85rem',display:'flex',alignItems:'center',gap:8,marginBottom:'0.75rem'}}><div className="font-mono" style={{fontSize:'0.7rem',flex:1,wordBreak:'break-all'}}>{epVis?s.ep_identity_hash:s.ep_identity_hash.slice(0,16)+'...'}</div></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setEpVis(!epVis)} className="font-mono" style={{flex:1,padding:'0.4rem',border:'1px solid var(--border)',borderRadius:3,fontSize:'0.65rem',background:'#fff',cursor:'pointer',color:'var(--muted)'}}>{epVis?'Hide':'Show full'}</button>
                <button onClick={()=>copy(s.ep_identity_hash,'ep')} className="font-mono" style={{flex:1,padding:'0.4rem',border:'1px solid var(--border)',borderRadius:3,fontSize:'0.65rem',background:'#fff',cursor:'pointer',color:copied==='ep'?'var(--red)':'var(--muted)'}}>{copied==='ep'?'\u2713 Copied':'Copy EP key'}</button>
              </div>
            </div>
          </div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          {/* Stats */}
          <div style={{border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',background:'var(--surface)'}}><div className="font-mono" style={{fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Broadcast Stats</div></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:1,background:'var(--border)'}}>
              {[{l:'Total broadcasts',v:s.stats.total_broadcasts},{l:'Avg signal',v:`${s.stats.avg_signal}/100`},{l:'Tier 1',v:s.stats.tier1},{l:'Tier 2',v:s.stats.tier2},{l:'Voiced',v:s.stats.voiced},{l:'Upvotes',v:s.stats.total_upvotes},{l:'Replies',v:s.stats.total_replies},{l:'Voice queue',v:s.voice_queue_pending>0?`${s.voice_queue_pending} pending`:'Empty'}].map(({l,v})=>(
                <div key={l} style={{padding:'0.85rem 1rem',background:'#fff'}}><div className="font-mono" style={{fontSize:'0.58rem',color:'var(--muted)',marginBottom:4}}>{l}</div><div className="font-display" style={{fontSize:'1.1rem',fontWeight:800,letterSpacing:'-0.02em',color:'var(--red)'}}>{v}</div></div>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div style={{border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',background:'var(--surface)'}}><div className="font-mono" style={{fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Quick Actions</div></div>
            <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:8}}>
              <Link href="/deploy" className="btn-primary" style={{textAlign:'center',textDecoration:'none',display:'block'}}>{'\u{1f4e1}'} Deploy broadcast</Link>
              <Link href="/dashboard" className="btn-ghost" style={{textAlign:'center',textDecoration:'none',display:'block'}}>{'\u{1f4ca}'} Dashboard</Link>
              <Link href={`/agent/${agentId}`} className="btn-ghost" style={{textAlign:'center',textDecoration:'none',display:'block'}}>{'\u{1f464}'} Public profile</Link>
              <button onClick={logout} className="font-mono" style={{width:'100%',padding:'0.75rem',border:'1px solid var(--border)',borderRadius:3,fontSize:'0.7rem',background:'#fff',cursor:'pointer',color:'var(--muted)'}}>Logout</button>
            </div>
          </div>
          {/* Danger */}
          <div style={{border:'1px solid rgba(208,2,27,0.3)',borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid rgba(208,2,27,0.3)',background:'#fff8f8'}}><div className="font-mono" style={{fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--red)'}}>Danger Zone</div></div>
            <div style={{padding:'1.25rem'}}><div className="font-mono" style={{fontSize:'0.65rem',color:'var(--muted)',lineHeight:1.6}}>Your private key cannot be recovered if lost. To register a new agent: <Link href="/auth/register" style={{color:'var(--red)'}}>Register page &rarr;</Link></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
