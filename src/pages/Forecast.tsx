import { Users, Euro, UserCheck, Star } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Badge } from '@/components/ui/Badge'
import { demoForecasts, demoWeather } from '@/lib/demoData'
import { formatCurrency, formatNumber, dayOfWeekNl, formatDateNl, scoreColor } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export default function Forecast() {
  const weatherByDate = Object.fromEntries(demoWeather.map(w => [w.date, w]))

  const chartData = demoForecasts.map(fc => ({
    label: `${formatDateNl(fc.date)}`,
    omzet: fc.predicted_revenue,
    confidence: fc.confidence_score,
    date: fc.date,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Forecast</h1>
        <p className="text-sm text-[#9ca3af] mt-1">14-daagse omzet- en drukteverwachting</p>
      </div>

      {/* Revenue forecast chart */}
      <Card>
        <CardHeader>
          <CardTitle>Verwachte omzet per dag</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
              formatter={(value) => [formatCurrency(Number(value)), 'Verwachte omzet']}
            />
            <Bar dataKey="omzet" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.date} fill={scoreColor(entry.confidence)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs text-[#6b7280]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Hoge confidence (&gt;75)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Gemiddeld (50–75)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Laag (&lt;50)</span>
        </div>
      </Card>

      {/* Daily forecast cards */}
      <div className="space-y-3">
        {demoForecasts.map(fc => {
          const w = weatherByDate[fc.date]
          return (
            <Card key={fc.date} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Date */}
                <div className="w-32 shrink-0">
                  <p className="text-base font-bold text-[#f9fafb]">{dayOfWeekNl(fc.date)}</p>
                  <p className="text-xs text-[#9ca3af]">{formatDateNl(fc.date)}</p>
                  <Badge variant={fc.confidence_score >= 70 ? 'success' : fc.confidence_score >= 50 ? 'warning' : 'danger'} className="mt-1">
                    {fc.confidence_score}% zekerheid
                  </Badge>
                </div>

                {/* Weather snapshot */}
                {w && (
                  <div className="flex items-center gap-3 bg-[#0d1321] rounded-xl px-4 py-2 shrink-0">
                    <span className="text-2xl">{w.temp_max >= 25 ? '☀️' : w.temp_max >= 20 ? '⛅' : '🌤️'}</span>
                    <div>
                      <p className="text-sm font-bold text-[#f9fafb]">{Math.round(w.temp_max)}°C</p>
                      <p className="text-xs text-[#6b7280]">{w.wind_speed_kmh} km/u</p>
                    </div>
                  </div>
                )}

                {/* KPIs */}
                <div className="flex flex-wrap gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Euro size={14} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Omzet</p>
                      <p className="text-sm font-bold text-[#f9fafb]">{formatCurrency(fc.predicted_revenue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-emerald-400" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Gasten</p>
                      <p className="text-sm font-bold text-[#f9fafb]">{formatNumber(fc.predicted_guests)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-amber-400" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Personeel</p>
                      <p className="text-sm font-bold text-[#f9fafb]">{fc.recommended_staff} pers.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-purple-400" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Top product</p>
                      <p className="text-sm font-bold text-[#f9fafb]">{fc.predicted_top_products[0]?.product}</p>
                    </div>
                  </div>
                </div>

                {/* Score rings */}
                <div className="flex gap-3 shrink-0">
                  <ScoreRing score={fc.terrace_weather_score} size={56} strokeWidth={6} label="Terras" />
                  <ScoreRing score={fc.beach_vibe_score} size={56} strokeWidth={6} label="Beach" />
                  <ScoreRing score={fc.german_visitor_probability} size={56} strokeWidth={6} label="DE" />
                </div>
              </div>

              {/* Top products */}
              <div className="mt-3 pt-3 border-t border-[#1f2937] flex flex-wrap gap-2">
                {fc.predicted_top_products.slice(0, 4).map(p => (
                  <div key={p.product} className="flex items-center gap-1.5 bg-[#0d1321] rounded-lg px-2.5 py-1">
                    <span className="text-xs text-[#9ca3af]">{p.product}</span>
                    <span className="text-xs font-medium text-[#f9fafb]">{p.quantity} st.</span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
