import { Euro, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import { KPICard } from '@/components/dashboard/KPICard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { HourlyHeatmap } from '@/components/dashboard/HourlyHeatmap'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { ForecastStrip } from '@/components/dashboard/ForecastStrip'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useDailySales, useHourlySales } from '@/hooks/useDailySales'
import { useForecasts } from '@/hooks/useForecasts'
import { useWeather } from '@/hooks/useWeather'
import { useAIInsights } from '@/hooks/useAIInsights'
import { format, subDays } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const { data: dailySales = [] } = useDailySales(60)
  const { data: hourlySales = [] } = useHourlySales(yesterday)
  const { data: forecasts = [] } = useForecasts(14)
  const { data: weather = [], isLoading: weatherLoading } = useWeather(14)
  const { data: insights = [] } = useAIInsights()

  const todayFc = forecasts[0]
  const todayWeather = weather[0]
  const yesterdaySales = dailySales[dailySales.length - 1]
  const prevWeekSameDay = dailySales[dailySales.length - 8]

  if (!todayFc || !yesterdaySales) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb]">Dashboard</h1>
          <p className="text-sm text-[#9ca3af] mt-1">Data wordt geladen...</p>
        </div>
      </div>
    )
  }

  const revenueChange = prevWeekSameDay
    ? ((yesterdaySales.total_revenue - prevWeekSameDay.total_revenue) / prevWeekSameDay.total_revenue) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Dashboard</h1>
        <p className="text-sm text-[#9ca3af] mt-1">Overzicht van omzet, forecast en weer</p>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Omzet gisteren"
          value={yesterdaySales.total_revenue}
          format="currency"
          change={revenueChange}
          icon={<Euro size={16} />}
          subtitle={`${yesterdaySales.total_transactions} transacties`}
          accentColor="#3b82f6"
        />
        <KPICard
          title="Gasten gisteren"
          value={yesterdaySales.total_guests}
          format="number"
          icon={<Users size={16} />}
          subtitle={`Gem. €${yesterdaySales.avg_spend_per_guest.toFixed(2)} p.p.`}
          accentColor="#10b981"
        />
        <KPICard
          title="Verwachte omzet vandaag"
          value={todayFc.predicted_revenue}
          format="currency"
          icon={<TrendingUp size={16} />}
          subtitle={`Confidence ${todayFc.confidence_score}%`}
          accentColor="#f59e0b"
        />
        <KPICard
          title="Cocktail omzet gisteren"
          value={yesterdaySales.cocktail_revenue}
          format="currency"
          icon={<ShoppingBag size={16} />}
          subtitle={`${Math.round((yesterdaySales.cocktail_revenue / yesterdaySales.total_revenue) * 100)}% van totaal`}
          accentColor="#a855f7"
        />
      </div>

      {/* Scores + Weather row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Beach Scores vandaag</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
            <ScoreRing score={todayFc.terrace_weather_score} label="Terras Weer" sublabel="score" />
            <ScoreRing score={todayFc.beach_vibe_score} label="Beach Vibe" sublabel="score" />
            <ScoreRing score={todayFc.cocktail_weather_index} label="Cocktail" sublabel="index" />
            <ScoreRing score={todayFc.aperol_index} label="Aperol" sublabel="index" />
            <ScoreRing score={todayFc.german_visitor_probability} label="Duits bezoek" sublabel="kans" />
            <ScoreRing score={todayFc.bbq_potential} label="BBQ" sublabel="potentieel" />
            <ScoreRing score={todayFc.sunset_traffic_score} label="Zonsondergang" sublabel="drukte" />
            <ScoreRing score={todayFc.outdoor_seating_potential} label="Buitenterras" sublabel="potentieel" />
          </div>
        </Card>
        {weatherLoading || !todayWeather ? (
          <div className="rounded-2xl bg-[#111827] border border-[#1f2937] shadow-xl p-6 flex items-center justify-center">
            <p className="text-sm text-[#9ca3af]">Weerdata ophalen...</p>
          </div>
        ) : (
          <WeatherWidget weather={todayWeather} label="Vandaag" />
        )}
      </div>

      <RevenueChart data={dailySales} />
      <HourlyHeatmap data={hourlySales} />
      <ForecastStrip forecasts={forecasts} weather={weather} />

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Inzichten</CardTitle>
            <Badge variant="accent">AI</Badge>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {insights.slice(0, 3).map(insight => (
            <div key={insight.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1321] border border-[#1f2937]">
              <div className="flex-1">
                <p className="text-sm text-[#f9fafb]">{insight.insight_text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={insight.impact_pct > 0 ? 'success' : 'danger'}>
                    {insight.impact_pct > 0 ? '+' : ''}{insight.impact_pct}%
                  </Badge>
                  <span className="text-xs text-[#6b7280]">Confidence {insight.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top products */}
      <Card>
        <CardHeader>
          <CardTitle>Verwachte top producten vandaag</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {todayFc.predicted_top_products.map((p, i) => (
            <div key={p.product} className="flex items-center gap-3">
              <span className="text-xs text-[#6b7280] w-5 text-right">{i + 1}</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-[#f9fafb]">{p.product}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#9ca3af]">{p.quantity} st.</span>
                  <span className="text-sm font-medium text-[#f9fafb]">{formatCurrency(p.revenue)}</span>
                </div>
              </div>
              <div className="w-24 bg-[#1f2937] rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: `${(p.revenue / todayFc.predicted_top_products[0].revenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
