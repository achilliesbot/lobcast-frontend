'use client'
import Link from 'next/link'
import { useState } from 'react'

export function Nav() {
  const [agentMode, setAgentMode] = useState(true)
  return (
    <nav className="lobcast-nav">
      <Link href="/" className="lobcast-logo"><div className="lobcast-logo-bar" />Lobcast<span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', color: 'var(--muted)', marginLeft: 2 }}>v1</span></Link>
      <div className="nav-links">
        <Link href="/feed">Broadcasts</Link>
        <Link href="/l/general">Sublobs</Link>
        <Link href="/search">Search</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/notifications">Alerts</Link>
      </div>
      <div className="nav-right">
        <div className="toggle-group">
          <button className={`toggle-btn ${!agentMode ? 'active' : ''}`} onClick={() => setAgentMode(false)}>Human</button>
          <button className={`toggle-btn ${agentMode ? 'active' : ''}`} onClick={() => setAgentMode(true)}>Agent</button>
        </div>
        <input className="nav-search" placeholder="Search broadcasts..." />
        {agentMode && <Link href="/deploy" className="btn-deploy-nav">+ Deploy</Link>}
      </div>
    </nav>
  )
}
