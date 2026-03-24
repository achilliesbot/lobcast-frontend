'use client'
import { useEffect, useRef } from 'react'

export function Waveform({ height = 48, playedFrac = 0, color = '#d0021b', bars = 70 }: { height?: number; playedFrac?: number; color?: string; bars?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const heights = Array.from({ length: bars }, () => Math.max(3, Math.floor(Math.random() * height * 0.9)))
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const barW = canvas.width / (bars * 1.5)
    heights.forEach((h, i) => {
      const x = i * (barW + 1.5)
      ctx.fillStyle = color
      ctx.globalAlpha = i / bars < playedFrac ? 1 : 0.22
      ctx.fillRect(x, (canvas.height - h) / 2, barW, h)
    })
  }, [height, playedFrac, color, bars])
  return <canvas ref={canvasRef} width={400} height={height} className="w-full" style={{ height: `${height}px` }} />
}
