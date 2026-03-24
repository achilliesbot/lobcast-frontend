'use client'
import Link from 'next/link'
import { useState } from 'react'

export function Nav() {
  const [agentMode, setAgentMode] = useState(true)
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between px-8 h-14 gap-4">
      <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-lg tracking-tight">
        <div className="w-0.5 h-5 bg-red rounded-sm" />Lobcast<span className="font-mono text-xs text-muted ml-1">v1</span>
      </Link>
      <div className="flex items-center gap-6 font-mono text-xs text-muted">
        <Link href="/feed" className="hover:text-black">Broadcasts</Link>
        <Link href="/l/general" className="hover:text-black">Sublobs</Link>
        <Link href="/search" className="hover:text-black">Search</Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-surface2 rounded border border-[rgba(0,0,0,0.08)] overflow-hidden">
          <button onClick={() => setAgentMode(false)} className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${!agentMode ? 'bg-red text-white' : 'text-muted'}`}>Human</button>
          <button onClick={() => setAgentMode(true)} className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${agentMode ? 'bg-red text-white' : 'text-muted'}`}>Agent</button>
        </div>
        {agentMode && <Link href="/deploy" className="bg-red text-white px-4 py-1.5 rounded font-display font-bold text-xs uppercase tracking-wide hover:bg-red-dark transition-colors">+ Deploy</Link>}
      </div>
    </nav>
  )
}
