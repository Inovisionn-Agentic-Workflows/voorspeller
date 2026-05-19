import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'accent'

const variantClasses: Record<Variant, string> = {
  default: 'bg-[#1f2937] text-[#9ca3af]',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
  accent: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

interface BadgeProps {
  variant?: Variant
  className?: string
  children: ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantClasses[variant], className)}>
      {children}
    </span>
  )
}
