import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DailySales } from '@/types'
import { shortDayNl, formatDateNl, formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

interface RevenueChartProps {
  data: DailySales[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.slice(-30).map(d => ({
    date: d.date,
    label: formatDateNl(d.date),
    day: shortDayNl(d.date),
    omzet: d.total_revenue,
    cocktails: d.cocktail_revenue,
    food: d.food_revenue,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Omzet afgelopen 30 dagen</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOmzet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCocktail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `€${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === 'omzet' ? 'Totale omzet' : name === 'cocktails' ? 'Cocktails' : 'Food',
            ]}
            labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
          />
          <Area type="monotone" dataKey="omzet" stroke="#3b82f6" strokeWidth={2} fill="url(#gradOmzet)" />
          <Area type="monotone" dataKey="cocktails" stroke="#f59e0b" strokeWidth={1.5} fill="url(#gradCocktail)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
