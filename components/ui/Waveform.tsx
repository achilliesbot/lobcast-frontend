'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  height?: number
  color?: string
  bars?: number
  audioUrl?: string | null
  broadcastId?: string
  autoFetch?: boolean
  onPlayStateChange?: (playing: boolean) => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lobcast.onrender.com'

export function Waveform({
  height = 48,
  color = '#d0021b',
  bars = 70,
  audioUrl,
  broadcastId,
  autoFetch = false,
  onPlayStateChange
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const heightsRef = useRef<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(audioUrl || null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (resolvedUrl || !broadcastId || !autoFetch) return
    setFetching(true)
    fetch(`${API_BASE}/lobcast/broadcast/audio/${broadcastId}`)
      .then(r => r.json())
      .then(d => { if (d.audio_url) setResolvedUrl(d.audio_url) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [broadcastId, autoFetch, resolvedUrl])

  useEffect(() => {
    if (heightsRef.current.length === 0) {
      heightsRef.current = Array.from({ length: bars }, () =>
        Math.max(3, Math.floor(Math.random() * height * 0.85))
      )
    }
  }, [bars, height])

  const drawCanvas = useCallback((prog: number) => {
    const canvas = canvasRef.current
    if (!canvas || heightsRef.current.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    canvas.width = w * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, height)
    const barW = Math.max(2, w / (bars * 1.5))
    heightsRef.current.forEach((h, i) => {
      const x = i * (barW + 1.5)
      ctx.fillStyle = color
      ctx.globalAlpha = i / bars < prog ? 1 : 0.22
      ctx.beginPath()
      ctx.roundRect(x, (height - h) / 2, barW, h, 1)
      ctx.fill()
    })
  }, [height, color, bars])

  useEffect(() => { drawCanvas(progress) }, [drawCanvas, progress])

  const togglePlay = () => {
    if (!resolvedUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(resolvedUrl)
      audioRef.current.ontimeupdate = () => {
        const a = audioRef.current!
        const prog = a.duration ? a.currentTime / a.duration : 0
        setProgress(prog)
      }
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setProgress(0)
        onPlayStateChange?.(false)
      }
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      onPlayStateChange?.(false)
    } else {
      audioRef.current.play().catch(e => console.error('Audio play error:', e))
      setIsPlaying(true)
      onPlayStateChange?.(true)
    }
  }

  const hasAudio = !!resolvedUrl

  return (
    <div
      style={{ position: 'relative', width: '100%', cursor: hasAudio ? 'pointer' : 'default' }}
      onClick={hasAudio ? togglePlay : undefined}
      title={hasAudio ? (isPlaying ? 'Pause' : 'Play broadcast') : 'Text-only'}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
      {fetching && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', color: 'var(--muted)' }}>
          loading audio...
        </div>
      )}
      {!hasAudio && !fetching && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          text-only
        </div>
      )}
      {hasAudio && (
        <div style={{ position: 'absolute', bottom: 2, right: 4, fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: isPlaying ? color : 'var(--muted)' }}>
          {isPlaying ? 'playing' : 'play'}
        </div>
      )}
    </div>
  )
}
