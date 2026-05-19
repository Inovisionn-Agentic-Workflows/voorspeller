import { Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { demoForecasts, demoHourlySales } from '@/lib/demoData'
import { formatCurrency, dayOfWeekNl, formatDateNl, scoreColor } from '@/lib/utils'

interface ShiftSlot {
  role: string
  start: string
  end: string
  count: number
}

function generateShifts(staffCount: number): ShiftSlot[] {
  return [
    { role: 'Barmedewerker', start: '11:00', end: '17:00', count: Math.max(1, Math.round(staffCount * 0.2)) },
    { role: 'Barmedewerker', start: '15:00', end: '23:00', count: Math.max(1, Math.round(staffCount * 0.25)) },
    { role: 'Bediening', start: '11:00', end: '17:00', count: Math.max(1, Math.round(staffCount * 0.2)) },
    { role: 'Bediening', start: '15:00', end: '23:00', count: Math.max(1, Math.round(staffCount * 0.2)) },
    { role: 'Terrashulp', start: '12:00', end: '19:00', count: Math.max(1, Math.round(staffCount * 0.1)) },
    { role: 'Keukenmedewerker', start: '11:00', end: '21:00', count: Math.max(1, Math.round(staffCount * 0.15)) },
  ]
}

export default function StaffPlanning() {
  const upcomingDays = demoForecasts.slice(0, 7)

  const hourlyData = demoHourlySales.map(h => ({
    hour: `${h.hour}:00`,
    omzet: h.revenue,
    staff: Math.max(2, Math.round(h.revenue / 150)),
  }))

  const peakHour = hourlyData.reduce((max, h) => h.omzet > max.omzet ? h : max, hourlyData[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Personeelsplanning</h1>
        <p className="text-sm text-[#9ca3af] mt-1">AI-aanbevolen personeelsinzet per dag en per uur</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-[#f9fafb]">{upcomingDays[0].recommended_staff}</p>
              <p className="text-xs text-[#9ca3af]">Vandaag aanbevolen</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-[#f9fafb]">
                {Math.max(...upcomingDays.map(d => d.recommended_staff))}
              </p>
              <p className="text-xs text-[#9ca3af]">Max deze week</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-[#f9fafb]">{peakHour?.hour}</p>
              <p className="text-xs text-[#9ca3af]">Piekuur gisteren</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <div>
              <p className="text-2xl font-bold text-[#f9fafb]">
                {upcomingDays.filter(d => d.recommended_staff >= 10).length}
              </p>
              <p className="text-xs text-[#9ca3af]">Drukke dagen (10+ pers.)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly overview */}
      <Card>
        <CardHeader>
          <CardTitle>Aanbevolen personeel komende 7 dagen</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={upcomingDays.map(d => ({
            label: `${dayOfWeekNl(d.date).slice(0, 2)} ${formatDateNl(d.date)}`,
            staff: d.recommended_staff,
            confidence: d.confidence_score,
          }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
              formatter={(value) => [`${value} personen`, 'Aanbevolen personeel']}
            />
            <Bar dataKey="staff" radius={[6, 6, 0, 0]}>
              {upcomingDays.map(d => (
                <Cell key={d.date} fill={scoreColor(d.confidence_score)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily cards */}
      <div className="space-y-3">
        {upcomingDays.map(fc => {
          const shifts = generateShifts(fc.recommended_staff)
          return (
            <Card key={fc.date} className="p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-base font-bold text-[#f9fafb]">
                    {dayOfWeekNl(fc.date)} <span className="text-[#9ca3af] font-normal text-sm">{formatDateNl(fc.date)}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={fc.recommended_staff >= 10 ? 'warning' : fc.recommended_staff >= 7 ? 'accent' : 'success'}>
                      {fc.recommended_staff} personen
                    </Badge>
                    <span className="text-xs text-[#6b7280]">Verwachte omzet {formatCurrency(fc.predicted_revenue)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6b7280]">Geschatte personeelskosten</p>
                  <p className="text-sm font-bold text-[#f9fafb]">
                    {formatCurrency(fc.recommended_staff * 12 * 8)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {shifts.map((shift, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d1321] border border-[#1f2937]">
                    <div>
                      <p className="text-xs font-medium text-[#f9fafb]">{shift.role}</p>
                      <p className="text-[10px] text-[#6b7280]">{shift.start} – {shift.end}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: shift.count }).map((_, j) => (
                        <div key={j} className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <Users size={10} className="text-blue-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Hourly staffing chart */}
      <Card>
        <CardHeader>
          <CardTitle>Bezetting per uur (aanbeveling)</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
              formatter={(value) => [`${value} personen`, 'Aanbevolen bezetting']}
            />
            <Bar dataKey="staff" radius={[4, 4, 0, 0]} fill="#3b82f6" fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
