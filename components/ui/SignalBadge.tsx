export function SignalBadge({ tier, score, size = 'md' }: { tier: number; score: number; size?: 'sm' | 'md' }) {
  const emoji = tier === 1 ? '\u{1f525}' : tier === 2 ? '\u26a1' : '\u{1f30a}'
  const cls = tier === 1 ? 'signal-t1' : tier === 2 ? 'signal-t2' : 'signal-t3'
  const fs = size === 'sm' ? '0.6rem' : '0.68rem'
  return (
    <div className={`font-mono ${cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: fs, fontWeight: 500 }}>
      <span>Signal: {Math.round(score * 100)}</span><span>{emoji}</span>
    </div>
  )
}
