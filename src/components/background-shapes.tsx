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

      // Fill base
      ctx.fillStyle = "#F5EFE6"
      ctx.fillRect(0, 0, w, h)

      // Blob configs: [x%, y%, radiusMultiplier, color]
      const blobs: [number, number, number, string][] = [
        // Blue blobs - dominant
        [0.15, 0.2, 0.38, "rgba(127, 166, 201, 0.55)"],
        [0.75, 0.15, 0.32, "rgba(127, 166, 201, 0.45)"],
        [0.5, 0.7, 0.42, "rgba(127, 166, 201, 0.5)"],
        [0.85, 0.65, 0.28, "rgba(127, 166, 201, 0.4)"],
        [0.3, 0.85, 0.3, "rgba(127, 166, 201, 0.35)"],
        // Sage green
        [0.6, 0.35, 0.3, "rgba(168, 187, 163, 0.45)"],
        [0.1, 0.6, 0.26, "rgba(168, 187, 163, 0.4)"],
        // Peach / warm
        [0.4, 0.15, 0.24, "rgba(230, 165, 143, 0.35)"],
        [0.8, 0.45, 0.22, "rgba(201, 123, 99, 0.3)"],
        // Lavender
        [0.25, 0.5, 0.26, "rgba(201, 183, 217, 0.35)"],
        [0.65, 0.85, 0.2, "rgba(201, 183, 217, 0.3)"],
      ]

      const baseRadius = Math.min(w, h) * 0.5

      for (const [xPct, yPct, rMul, color] of blobs) {
        const cx = w * xPct
        const cy = h * yPct
        const r = baseRadius * rMul

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, "rgba(245, 239, 230, 0)")

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
