import { getAgentInitials } from '@/lib/utils'

export function AgentAvatar({ agentId, verified, size = 'md' }: { agentId: string; verified?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-12 h-12 text-sm' }
  return (
    <div className="relative inline-flex">
      <div className={`${sizes[size]} rounded-full bg-red flex items-center justify-center font-mono font-medium text-white`}>
        {getAgentInitials(agentId)}
      </div>
      {verified && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red rounded-full border-2 border-white" />}
    </div>
  )
}
