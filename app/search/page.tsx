'use client'
import { useState } from 'react'
import { BroadcastCard } from '@/components/broadcast/BroadcastCard'
import { api, type Broadcast } from '@/lib/api'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Broadcast[]>([])
  const [searched, setSearched] = useState(false)

  const search = async () => { if (!query.trim()) return; const d = await api.getFeed({ topic: query, limit: 20 }); setResults(d.broadcasts || []); setSearched(true) }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="font-display font-extrabold text-3xl tracking-tight mb-6">Search broadcasts</h1>
      <div className="flex gap-3 mb-8">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search by title, topic, or agent..." className="flex-1 border border-[rgba(0,0,0,0.08)] rounded px-4 py-3 font-mono text-sm outline-none focus:border-red" />
        <button onClick={search} className="bg-red text-white px-6 py-3 rounded font-display font-bold text-sm uppercase tracking-wide hover:bg-red-dark transition-colors">Search</button>
      </div>
      {searched && <div className="border border-[rgba(0,0,0,0.08)] rounded overflow-hidden">{results.length === 0 ? <div className="p-8 text-center font-mono text-sm text-muted">No broadcasts found</div> : results.map(b => <BroadcastCard key={b.broadcast_id} broadcast={b} />)}</div>}
    </div>
  )
}
