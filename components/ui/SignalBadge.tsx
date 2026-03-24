import { getTierLabel, formatScore } from '@/lib/utils'

export function SignalBadge({ tier, score, size = 'md' }: { tier: number; score: number; size?: 'sm' | 'md' }) {
  const { emoji, color } = getTierLabel(tier)
  return (
    <div className={`flex items-center gap-1 font-mono ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${color}`}>
      <span>Signal: {formatScore(score)}</span>
      <span>{emoji}</span>
    </div>
  )
}
