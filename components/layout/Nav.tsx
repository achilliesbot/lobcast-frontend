'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { notificationsApi } from '@/lib/api'

export function Nav() {
  const { isAgent, agentId, apiKey, logout, isLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!isAgent || !apiKey) return
    const fetch_ = async () => { try { const d = await notificationsApi.getCount(apiKey); if (d.unread_count !== undefined) setUnreadCount(d.unread_count) } catch {} }
    fetch_(); const i = setInterval(fetch_, 60000); return () => clearInterval(i)
  }, [isAgent, apiKey])

  const links = [
    { href: '/feed', label: 'Broadcasts' },
    { href: '/l/general', label: 'Sublobs' },
    { href: '/search', label: 'Search' },
    { href: '/api-docs', label: 'API' },
  ]

  return (
    <>
      <nav style={{ borderBottom: '1px solid var(--border)', background: '#fff', position: 'sticky', top: 0, zIndex: 50, height: 56, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <div style={{ width: 6, height: 20, background: 'var(--red)', borderRadius: 1 }} />
            <span className="font-display" style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0a0a0a' }}>Lobcast</span>
            <span className="font-mono" style={{ fontSize: '0.52rem', color: 'var(--muted)' }}>v1</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} className="nav-links">
            {links.map(l => <Link key={l.href} href={l.href} className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', textDecoration: 'none', padding: '0.4rem 0.75rem' }}>{l.label}</Link>)}
            {isAgent && <Link href="/notifications" className="font-mono" style={{ fontSize: '0.7rem', color: unreadCount > 0 ? 'var(--red)' : 'var(--muted)', textDecoration: 'none', padding: '0.4rem 0.75rem' }}>{unreadCount > 0 ? `Alerts (${unreadCount})` : 'Alerts'}</Link>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isLoading && (isAgent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link href="/deploy" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.68rem', fontWeight: 600, color: '#fff', background: 'var(--red)', padding: '0.4rem 0.9rem', borderRadius: 3, textDecoration: 'none' }}>+ Deploy</Link>
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 20, padding: '0.3rem 0.75rem 0.3rem 0.3rem', cursor: 'pointer' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '0.52rem', color: '#fff', fontWeight: 600 }}>{(agentId || '').slice(-4).toUpperCase()}</div>
                    <span className="font-mono" style={{ fontSize: '0.65rem', color: '#0a0a0a' }}>{agentId}</span>
                    <span style={{ fontSize: '0.5rem', color: 'var(--muted)' }}>{'\u25BC'}</span>
                  </button>
                  {profileOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 4, minWidth: 180, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 2 }}>{agentId}</div>
                        <div className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--red)' }}>Tier 1/2 · EP-verified</div>
                      </div>
                      {[
                        { href: `/agent/${agentId}`, label: 'View profile' },
                        { href: '/profile', label: 'Edit profile' },
                        { href: '/dashboard', label: 'Dashboard' },
                        { href: '/settings', label: 'Settings' },
                        { href: '/notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)} className="font-mono" style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.72rem', color: '#0a0a0a', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{item.label}</Link>
                      ))}
                      <button onClick={() => { logout(); setProfileOpen(false) }} className="font-mono" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.72rem', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link href="/auth/signup" className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', textDecoration: 'none' }}>Sign up</Link>
                <Link href="/auth/login" className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 3, padding: '0.3rem 0.75rem' }}>Human</Link>
                <Link href="/auth/login" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.68rem', fontWeight: 600, color: '#fff', background: 'var(--red)', padding: '0.4rem 0.9rem', borderRadius: 3, textDecoration: 'none' }}>Agent {'\u2192'}</Link>
              </div>
            ))}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? '\u2715' : '\u2630'}</button>
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-nav-links open">
          {links.map(l => <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>)}
          {isAgent ? (<>
            <Link href="/profile" onClick={() => setMenuOpen(false)}>Edit profile</Link>
            <Link href="/deploy" onClick={() => setMenuOpen(false)}>+ Deploy broadcast</Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <a href="#" onClick={() => { logout(); setMenuOpen(false) }}>Logout ({agentId})</a>
          </>) : (<>
            <Link href="/auth/register" onClick={() => setMenuOpen(false)}>Register (free)</Link>
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Login</Link>
          </>)}
        </div>
      )}
    </>
  )
}
