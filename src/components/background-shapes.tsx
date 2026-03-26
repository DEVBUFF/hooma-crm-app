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

      // Read brand colours from CSS variables
      const styles = getComputedStyle(document.documentElement)
      const bgBase = styles.getPropertyValue("--hooma-bg-base").trim() || "#F8F7F4"
      const primary = styles.getPropertyValue("--hooma-primary").trim() || "#7B8CDE"
      const info = styles.getPropertyValue("--hooma-info").trim() || "#2563EB"
      const success = styles.getPropertyValue("--hooma-success").trim() || "#2E8B57"
      const purple = styles.getPropertyValue("--hooma-purple").trim() || "#af52de"

      // Helper: hex to rgba
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }

      // Fill base
      ctx.fillStyle = bgBase
      ctx.fillRect(0, 0, w, h)

      // Blob configs: [x%, y%, radiusMultiplier, color]
      const blobs: [number, number, number, string][] = [
        // Subtle primary blobs
        [0.15, 0.2, 0.40, hexToRgba(primary, 0.04)],
        [0.75, 0.15, 0.35, hexToRgba(primary, 0.03)],
        [0.5, 0.7, 0.45, hexToRgba(info, 0.04)],
        [0.85, 0.65, 0.30, hexToRgba(primary, 0.03)],
        // Subtle purple
        [0.3, 0.85, 0.32, hexToRgba(purple, 0.03)],
        [0.25, 0.5, 0.28, hexToRgba(purple, 0.02)],
        // Subtle green
        [0.6, 0.35, 0.32, hexToRgba(success, 0.03)],
        [0.1, 0.6, 0.28, hexToRgba(success, 0.02)],
        // Warm white highlights
        [0.4, 0.15, 0.26, "rgba(255, 255, 255, 0.50)"],
        [0.8, 0.45, 0.24, "rgba(255, 255, 255, 0.40)"],
      ]

      const baseRadius = Math.min(w, h) * 0.5
      const bgBaseTransparent = hexToRgba(bgBase, 0)

      for (const [xPct, yPct, rMul, color] of blobs) {
        const cx = w * xPct
        const cy = h * yPct
        const r = baseRadius * rMul

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, bgBaseTransparent)

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
