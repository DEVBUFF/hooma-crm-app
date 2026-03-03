"use client"

import { useEffect, useRef } from "react"

export function BackgroundShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)

      const w = window.innerWidth
      const h = window.innerHeight

      // Fill base — clean Apple-style light gray
      ctx.fillStyle = "#f5f5f7"
      ctx.fillRect(0, 0, w, h)

      // Blob configs: [x%, y%, radiusMultiplier, color]
      const blobs: [number, number, number, string][] = [
        // Subtle blue blobs
        [0.15, 0.2, 0.40, "rgba(0, 113, 227, 0.04)"],
        [0.75, 0.15, 0.35, "rgba(0, 113, 227, 0.03)"],
        [0.5, 0.7, 0.45, "rgba(0, 122, 255, 0.04)"],
        [0.85, 0.65, 0.30, "rgba(0, 113, 227, 0.03)"],
        // Subtle purple
        [0.3, 0.85, 0.32, "rgba(175, 82, 222, 0.03)"],
        [0.25, 0.5, 0.28, "rgba(175, 82, 222, 0.02)"],
        // Subtle green
        [0.6, 0.35, 0.32, "rgba(52, 199, 89, 0.03)"],
        [0.1, 0.6, 0.28, "rgba(52, 199, 89, 0.02)"],
        // Warm white highlights
        [0.4, 0.15, 0.26, "rgba(255, 255, 255, 0.50)"],
        [0.8, 0.45, 0.24, "rgba(255, 255, 255, 0.40)"],
      ]

      const baseRadius = Math.min(w, h) * 0.5

      for (const [xPct, yPct, rMul, color] of blobs) {
        const cx = w * xPct
        const cy = h * yPct
        const r = baseRadius * rMul

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, "rgba(245, 245, 247, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    draw()
    window.addEventListener("resize", draw)

    return () => {
      window.removeEventListener("resize", draw)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full blur-[40px] scale-110"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  )
}
