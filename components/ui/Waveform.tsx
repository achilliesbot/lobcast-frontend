'use client'
import { useEffect, useRef } from 'react'

export function Waveform({ height = 48, playedFrac = 0, color = '#d0021b', bars = 70 }: { height?: number; playedFrac?: number; color?: string; bars?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const heightsRef = useRef<number[]>([])
  useEffect(() => {
    if (heightsRef.current.length === 0) heightsRef.current = Array.from({ length: bars }, () => Math.max(3, Math.floor(Math.random() * height * 0.85)))
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, canvas.offsetWidth, height)
    const barW = Math.max(2, canvas.offsetWidth / (bars * 1.5))
    heightsRef.current.forEach((h, i) => {
      const x = i * (barW + 1.5)
      ctx.fillStyle = color
      ctx.globalAlpha = i / bars < playedFrac ? 1 : 0.22
      ctx.beginPath()
      ctx.roundRect(x, (height - h) / 2, barW, h, 1)
      ctx.fill()
    })
  }, [height, playedFrac, color, bars])
  return <canvas ref={ref} style={{ width: '100%', height: `${height}px`, display: 'block' }} />
}
