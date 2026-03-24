'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function CustomCursor() {
  const cursorDot = useRef<HTMLDivElement>(null)
  const cursorOutline = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e

      if (cursorDot.current) {
        cursorDot.current.style.left = `${x}px`
        cursorDot.current.style.top = `${y}px`
      }

      if (cursorOutline.current) {
        cursorOutline.current.style.left = `${x}px`
        cursorOutline.current.style.top = `${y}px`
      }
    }

    const handleMouseEnter = () => {
      if (cursorDot.current) cursorDot.current.style.opacity = '1'
      if (cursorOutline.current) cursorOutline.current.style.opacity = '1'
    }

    const handleMouseLeave = () => {
      if (cursorDot.current) cursorDot.current.style.opacity = '0'
      if (cursorOutline.current) cursorOutline.current.style.opacity = '0'
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      <style>{`
        * {
          cursor: none;
        }
        button, a, input, select, textarea, [role="button"] {
          cursor: none;
        }
      `}</style>

      <div
        ref={cursorDot}
        className="fixed pointer-events-none z-50 w-2 h-2 bg-gradient-to-r from-primary to-accent-gold rounded-full mix-blend-screen opacity-0 transition-opacity duration-150"
        style={{
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
        }}
      />

      <div
        ref={cursorOutline}
        className="fixed pointer-events-none z-50 w-8 h-8 border-2 border-primary rounded-full opacity-0 transition-opacity duration-150"
        style={{
          transform: 'translate(-50%, -50%)',
          borderImage: 'linear-gradient(135deg, #22c55e, #D4AF37) 1',
        }}
      />
    </>
  )
}
