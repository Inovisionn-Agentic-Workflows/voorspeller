import { Sparkles, TrendingUp, TrendingDown, Cloud, Package, Users, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { demoInsights, demoForecasts } from '@/lib/demoData'
import { formatDateNl } from '@/lib/utils'
import type { InsightType } from '@/types'

const TYPE_ICONS: Record<InsightType, typeof TrendingUp> = {
  revenue: TrendingUp,
  product: Package,
  staff: Users,
  weather: Cloud,
  holiday: Calendar,
}

const TYPE_LABELS: Record<InsightType, string> = {
  revenue: 'Omzet',
  product: 'Product',
  staff: 'Personeel',
  weather: 'Weer',
  holiday: 'Feestdag',
}

export default function AIInsights() {
  const avgConfidence = Math.round(
    demoInsights.reduce((s, i) => s + i.confidence, 0) / demoInsights.length
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb]">AI Insights</h1>
          <p className="text-sm text-[#9ca3af] mt-1">Automatisch gegenereerde inzichten op basis van patronen</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-xs font-medium text-blue-400">AI-powered</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-[#f9fafb]">{demoInsights.length}</p>
          <p className="text-xs text-[#9ca3af] mt-1">Actieve inzichten</p>
        </Card>
        <Card className="text-center">
          <ScoreRing score={avgConfidence} size={60} />
          <p className="text-xs text-[#9ca3af] mt-2">Gem. confidence</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-400">
            +{Math.max(...demoInsights.map(i => i.impact_pct))}%
          </p>
          <p className="text-xs text-[#9ca3af] mt-1">Hoogste impact</p>
        </Card>
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {demoInsights.map(insight => {
          const Icon = TYPE_ICONS[insight.insight_type]
          const isPositive = insight.impact_pct > 0
          return (
            <Card key={insight.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <Icon size={18} className={isPositive ? 'text-emerald-400' : 'text-red-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f9fafb] font-medium leading-snug">{insight.insight_text}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant={isPositive ? 'success' : 'danger'}>
                      {isPositive ? <TrendingUp size={10} className="mr-1 inline" /> : <TrendingDown size={10} className="mr-1 inline" />}
                      {isPositive ? '+' : ''}{insight.impact_pct}% impact
                    </Badge>
                    <Badge variant="default">{TYPE_LABELS[insight.insight_type]}</Badge>
                    <span className="text-xs text-[#6b7280]">Geldig {formatDateNl(insight.valid_from)} – {formatDateNl(insight.valid_until)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <ScoreRing score={insight.confidence} size={52} strokeWidth={5} />
                  <p className="text-[10px] text-[#6b7280] mt-1">confidence</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pattern library */}
      <Card>
        <CardHeader>
          <CardTitle>Herkende patronen</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            '"Bij zuidenwind + 23°C + Duitse feestdag stijgt Aperol verkoop +240%"',
            '"Windkracht boven 5 daalt terrasomzet sterk"',
            '"Zaterdag met zon levert gemiddeld 2.8× meer cocktailverkoop"',
            '"Duitse bezoekers bestellen meer buckets bier en cocktails"',
            '"Zonsondergang na 21:00 verhoogt late-avond omzet +35%"',
            '"Schoolvakantie NRW verhoogt weekend bezoek significant"',
          ].map((pattern, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#0d1321] border border-[#1f2937]">
              <p className="text-xs text-[#9ca3af] italic">{pattern}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming high-impact days */}
      <Card>
        <CardHeader>
          <CardTitle>Komende high-impact dagen</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {demoForecasts
            .filter(fc => fc.holiday_boost_factor > 1.2 || fc.german_visitor_probability > 60)
            .slice(0, 5)
            .map(fc => (
              <div key={fc.date} className="flex items-center justify-between p-3 rounded-xl bg-[#0d1321] border border-[#1f2937]">
                <div>
                  <p className="text-sm font-medium text-[#f9fafb]">{formatDateNl(fc.date)}</p>
                  <p className="text-xs text-[#9ca3af]">
                    Boost ×{fc.holiday_boost_factor.toFixed(2)} · DE bezoek {fc.german_visitor_probability}%
                  </p>
                </div>
                <Badge variant={fc.holiday_boost_factor > 1.4 ? 'warning' : 'accent'}>
                  Hoge impact
                </Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
