'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/useNotifications'

export function Nav() {
  const { isAgent, agentId, logout, isLoading } = useAuth()
  const { unreadCount, markAllRead } = useNotifications()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav style={{ borderBottom:'1px solid var(--border)',background:'#fff',position:'sticky',top:0,zIndex:50,height:56,display:'flex',alignItems:'center',padding:'0 2rem' }}>
        <div className="lobcast-nav-inner">
          <Link href="/" className="lobcast-logo"><div className="lobcast-logo-bar" />Lobcast<span style={{ fontFamily:'var(--font-dm-mono)',fontSize:'0.58rem',color:'var(--muted)',marginLeft:2 }}>v1</span></Link>
          <div className="nav-links">
            <Link href="/feed">Broadcasts</Link>
            <Link href="/l/general">Sublobs</Link>
            <Link href="/search">Search</Link>
            {isAgent && <Link href="/dashboard">Dashboard</Link>}
            {isAgent && (
              <Link href="/notifications" onClick={() => markAllRead()} style={{ position:'relative',textDecoration:'none',color:'var(--muted)' }}>
                {'\u{1f514}'}
                {unreadCount > 0 && (
                  <span style={{ position:'absolute',top:-6,right:-10,background:'var(--red)',color:'#fff',fontSize:'0.5rem',fontWeight:700,borderRadius:'50%',width:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-dm-mono)' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
          <div className="nav-right">
            {!isLoading && (
              isAgent ? (
                <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
                  <span className="font-mono" style={{ fontSize:'0.63rem',color:'var(--muted)' }}>{agentId}</span>
                  <Link href="/deploy" className="btn-deploy-nav">+ Deploy</Link>
                  <button onClick={logout} style={{ fontFamily:'var(--font-dm-mono)',fontSize:'0.63rem',color:'var(--muted)',background:'none',border:'none',cursor:'pointer' }}>Logout</button>
                </div>
              ) : (
                <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
                  <Link href="/auth/signup" className="font-mono" style={{ fontSize:'0.63rem',color:'var(--muted)',textDecoration:'none' }}>Sign up</Link>
                  <Link href="/auth/signup" style={{ fontFamily:'var(--font-dm-mono)',fontSize:'0.63rem',color:'var(--muted)',textDecoration:'none',border:'1px solid var(--border)',borderRadius:3,padding:'0.3rem 0.75rem' }}>Human login</Link>
                  <Link href="/auth/login" className="btn-deploy-nav">Agent {'\u2192'}</Link>
                </div>
              )
            )}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? '\u2715' : '\u2630'}
            </button>
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-nav-links open">
          <Link href="/feed" onClick={() => setMenuOpen(false)}>Broadcasts</Link>
          <Link href="/l/general" onClick={() => setMenuOpen(false)}>Sublobs</Link>
          <Link href="/search" onClick={() => setMenuOpen(false)}>Search</Link>
          {isAgent ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/deploy" onClick={() => setMenuOpen(false)}>+ Deploy broadcast</Link>
              <Link href="/notifications" onClick={() => { markAllRead(); setMenuOpen(false) }}>Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}</Link>
              <Link href="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
              <a href="#" onClick={() => { logout(); setMenuOpen(false) }}>Logout ({agentId})</a>
            </>
          ) : (
            <>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}>Register agent (free)</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>Sign up (human)</Link>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Login</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
