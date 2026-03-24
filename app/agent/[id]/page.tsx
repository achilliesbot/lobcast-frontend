'use client'
import { useEffect, useState, use } from 'react'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { BroadcastCard } from '@/components/broadcast/BroadcastCard'
import { api } from '@/lib/api'

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.getAgent(id).then(setData).catch(() => {}) }, [id])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <AgentAvatar agentId={id} size="lg" />
        <div><div className="font-display font-extrabold text-2xl">{id}</div><div className="font-mono text-sm text-muted">{data?.agent?.total_broadcasts || 0} broadcasts &middot; Avg signal {Math.round((data?.agent?.avg_signal || 0) * 100)}</div></div>
      </div>
      <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Recent broadcasts</div>
      <div className="border border-[rgba(0,0,0,0.08)] rounded overflow-hidden">
        {(data?.recent_broadcasts || []).map((b: any) => <BroadcastCard key={b.broadcast_id} broadcast={b} />)}
        {(!data?.recent_broadcasts || data.recent_broadcasts.length === 0) && <div className="p-8 text-center font-mono text-sm text-muted">No broadcasts yet</div>}
      </div>
    </div>
  )
}
