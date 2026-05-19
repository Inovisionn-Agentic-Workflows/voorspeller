import type { Forecast, WeatherCache } from '@/types'
import { shortDayNl, formatDateNl, formatCurrency, scoreColor } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

interface ForecastStripProps {
  forecasts: Forecast[]
  weather: WeatherCache[]
}

function WeatherEmoji({ temp, rain }: { temp: number; rain: number }) {
  if (rain > 3) return '🌧️'
  if (temp >= 25) return '☀️'
  if (temp >= 20) return '⛅'
  return '🌤️'
}

export function ForecastStrip({ forecasts, weather }: ForecastStripProps) {
  const weatherByDate = Object.fromEntries(weather.map(w => [w.date, w]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>14-daagse forecast</CardTitle>
      </CardHeader>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {forecasts.map(fc => {
          const w = weatherByDate[fc.date]
          const barHeight = Math.round((fc.predicted_revenue / 8000) * 60)
          const color = scoreColor(fc.confidence_score)
          return (
            <div key={fc.date} className="flex flex-col items-center gap-1 min-w-[64px] flex-1">
              <span className="text-[10px] text-[#6b7280] font-medium">{shortDayNl(fc.date)}</span>
              <span className="text-[10px] text-[#6b7280]">{formatDateNl(fc.date)}</span>
              {w && (
                <span className="text-lg" title={`${Math.round(w.temp_max)}°C`}>
                  <WeatherEmoji temp={w.temp_max} rain={w.rain_mm} />
                </span>
              )}
              {w && <span className="text-[10px] text-[#9ca3af]">{Math.round(w.temp_max)}°</span>}
              <div className="w-full bg-[#1f2937] rounded-md overflow-hidden" style={{ height: 60 }}>
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: color,
                    marginTop: `${60 - barHeight}px`,
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-[#f9fafb]">
                {formatCurrency(fc.predicted_revenue).replace('€', '€')}
              </span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
                title={`Confidence: ${fc.confidence_score}%`}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
