import type { HourlySales } from '@/types'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface HourlyHeatmapProps {
  data: HourlySales[]
}

function heatColor(value: number, max: number): string {
  const ratio = value / max
  if (ratio > 0.85) return '#3b82f6'
  if (ratio > 0.65) return '#60a5fa'
  if (ratio > 0.45) return '#93c5fd'
  if (ratio > 0.25) return '#1e3a5f'
  return '#1f2937'
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  const max = Math.max(...data.map(d => d.revenue), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Omzet per uur (gisteren)</CardTitle>
      </CardHeader>
      <div className="flex gap-1 flex-wrap">
        {data.map(d => (
          <div key={d.hour} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
            <div
              className="w-full rounded-lg h-16 flex items-center justify-center text-xs font-bold transition-all cursor-default"
              style={{
                backgroundColor: heatColor(d.revenue, max),
                color: d.revenue / max > 0.45 ? '#f9fafb' : '#6b7280',
              }}
              title={`${d.hour}:00 — ${formatCurrency(d.revenue)}`}
            >
              {formatCurrency(d.revenue).replace('€', '').trim()}
            </div>
            <span className="text-[10px] text-[#6b7280]">{d.hour}u</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-[#6b7280]">Laag</span>
        <div className="flex gap-1">
          {['#1f2937', '#1e3a5f', '#93c5fd', '#60a5fa', '#3b82f6'].map(c => (
            <div key={c} className="w-5 h-2 rounded-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-xs text-[#6b7280]">Hoog</span>
      </div>
    </Card>
  )
}
