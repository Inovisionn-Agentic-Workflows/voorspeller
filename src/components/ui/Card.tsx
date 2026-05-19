import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-2xl bg-[#111827] border border-[#1f2937] shadow-xl p-6', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: CardProps) {
  return <h3 className={cn('text-sm font-medium text-[#9ca3af] uppercase tracking-wider', className)}>{children}</h3>
}
