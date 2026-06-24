import React, { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      if (!target) return
      
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.interactive-card') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea')

      if (isInteractive) {
        setHovered(true)
      } else {
        setHovered(false)
      }
    }

    const handleMouseDown = () => {
      setClicked(true)
    }

    const handleMouseUp = () => {
      setClicked(false)
    }

    const handleMouseLeave = () => {
      setVisible(false)
    }

    const handleMouseEnter = () => {
      setVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [visible])

  if (!visible) return null

  return (
    <>
      {/* Outer cursor glow ring with mix-blend-difference */}
      <div
        className={`pointer-events-none fixed z-[9999] rounded-full mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block ${
          hovered 
            ? clicked 
              ? 'h-10 w-10 bg-white opacity-90'
              : 'h-14 w-14 bg-white opacity-100'
            : clicked
              ? 'h-5 w-5 bg-transparent border border-white opacity-90'
              : 'h-8 w-8 bg-transparent border border-white/80 opacity-60'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: 'left 0.08s cubic-bezier(0.25, 1, 0.5, 1), top 0.08s cubic-bezier(0.25, 1, 0.5, 1), width 0.25s cubic-bezier(0.25, 1, 0.5, 1), height 0.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease, background-color 0.25s ease, border-color 0.25s ease'
        }}
      />
      {/* Inner solid dot with mix-blend-difference */}
      <div
        className={`pointer-events-none fixed z-[9999] h-2 w-2 rounded-full bg-white mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-150 ease-out hidden md:block ${
          hovered ? 'scale-0 opacity-0' : clicked ? 'scale-75' : 'scale-100'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </>
  )
}
