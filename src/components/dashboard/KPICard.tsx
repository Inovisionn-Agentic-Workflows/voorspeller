import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: number | string
  format?: 'currency' | 'number' | 'percent' | 'raw'
  change?: number
  icon?: ReactNode
  subtitle?: string
  className?: string
  accentColor?: string
}

export function KPICard({
  title,
  value,
  format = 'raw',
  change,
  icon,
  subtitle,
  className,
  accentColor = '#3b82f6',
}: KPICardProps) {
  const formatted =
    format === 'currency' ? formatCurrency(Number(value))
    : format === 'number' ? formatNumber(Number(value))
    : format === 'percent' ? `${Math.round(Number(value))}%`
    : String(value)

  const TrendIcon = change == null ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
  const trendColor = change == null ? '' : change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-[#9ca3af]'

  return (
    <div className={cn('rounded-2xl bg-[#111827] border border-[#1f2937] p-6 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${accentColor}18` }}>
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-bold text-[#f9fafb] leading-none">{formatted}</span>
        {TrendIcon && change != null && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
            <TrendIcon size={14} />
            <span>{Math.abs(Math.round(change))}%</span>
          </div>
        )}
      </div>
      {subtitle && <span className="text-xs text-[#6b7280]">{subtitle}</span>}
    </div>
  )
}
