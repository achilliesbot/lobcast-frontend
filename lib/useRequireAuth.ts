'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth'

export function useRequireAuth() {
  const { isAgent, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAgent) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAgent, isLoading, router, pathname])

  return { isAgent, isLoading }
}
