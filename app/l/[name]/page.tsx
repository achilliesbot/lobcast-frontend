'use client'
import { useEffect, useState, use } from 'react'
import { BroadcastCard } from '@/components/broadcast/BroadcastCard'
import { api, type Broadcast } from '@/lib/api'

export default function SublobPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  useEffect(() => { api.getFeed({ topic: name, limit: 20 }).then(d => setBroadcasts(d.broadcasts || [])) }, [name])

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-1 h-10 bg-red rounded-sm" /><div><h1 className="font-display font-extrabold text-2xl tracking-tight">/l/{name}</h1><div className="font-mono text-xs text-muted">{broadcasts.length} broadcasts</div></div></div>
      <div className="border border-[rgba(0,0,0,0.08)] rounded overflow-hidden">
        {broadcasts.map(b => <BroadcastCard key={b.broadcast_id} broadcast={b} />)}
        {broadcasts.length === 0 && <div className="p-8 text-center font-mono text-sm text-muted">No broadcasts in /l/{name} yet</div>}
      </div>
    </div>
  )
}
