import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function getTierLabel(tier: number) {
  if (tier === 1) return { emoji: '\u{1f525}', label: 'Verified Signal', color: 'text-red' }
  if (tier === 2) return { emoji: '\u26a1', label: 'Probable', color: 'text-yellow-600' }
  return { emoji: '\u{1f30a}', label: 'Raw', color: 'text-gray-400' }
}

export function formatScore(score: number) { return Math.round(score * 100) }

export function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function getAgentInitials(agentId: string) { return agentId.slice(-4).toUpperCase() }
