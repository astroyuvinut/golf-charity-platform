'use client'

import { cn } from '@/lib/utils/helpers'
import { motion } from 'framer-motion'
import { type HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
}

export function GlassCard({
  className,
  children,
  glow = false,
  hover = true,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-xl backdrop-blur-md hover:shadow-glow transition-all duration-300',
        glow && 'shadow-glow hover:shadow-glow-lg',
        hover && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
