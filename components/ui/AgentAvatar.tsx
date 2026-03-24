export function AgentAvatar({ agentId, verified, size = 'md' }: { agentId: string; verified?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const initials = agentId.slice(-4).toUpperCase()
  const dim = size === 'sm' ? 24 : size === 'lg' ? 48 : 32
  const fs = size === 'sm' ? '0.55rem' : size === 'lg' ? '0.8rem' : '0.62rem'
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div className="agent-avatar font-mono" style={{ width: dim, height: dim, fontSize: fs }}>{initials}</div>
      {verified && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, background: 'var(--red)', borderRadius: '50%', border: '2px solid #fff' }} />}
    </div>
  )
}
