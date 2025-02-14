"use client"

import { useRef, useEffect, useState } from "react"

interface SignatureCanvasProps {
  onChange: (signature: string) => void
}

export default function SignatureCanvas({ onChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const [canvasWidth, setCanvasWidth] = useState<number | null>(null)
  const [isFixed, setIsFixed] = useState(false)

  useEffect(() => {
    const updateWidth = () => {
      setCanvasWidth(window.innerWidth < 640 ? 250 : 500)
    }

    updateWidth() // Set width on mount
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasWidth === null) return // Prevent running before width is set

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "white"
    ctx.lineWidth = 2

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true
      setIsFixed(true)
      draw(e)
    }

    const stopDrawing = () => {
      isDrawing.current = false
      ctx.beginPath()
      onChange(canvas.toDataURL())
      setIsFixed(false)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return

      const rect = canvas.getBoundingClientRect()
      const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
      const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top

      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseout", stopDrawing)

    canvas.addEventListener("touchstart", startDrawing)
    canvas.addEventListener("touchmove", draw)
    canvas.addEventListener("touchend", stopDrawing)

    return () => {
      canvas.removeEventListener("mousedown", startDrawing)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseout", stopDrawing)

      canvas.removeEventListener("touchstart", startDrawing)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", stopDrawing)
    }
  }, [onChange, canvasWidth])

  if (canvasWidth === null) return null // Avoid rendering until width is set

  return (
    <div className={`${isFixed ? "fixed bottom-0 left-0 right-0 bg-violet-950 p-4 z-50" : ""} sm:static`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={200}
        className="border border-gray-300 rounded-md sm:w-[95%] md:w-[50%] sm:h-[25vh] md:h-[30vh]"
      />
    </div>
  )
}

