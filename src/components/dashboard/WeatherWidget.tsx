import { Droplets, Wind, Sun, Eye } from 'lucide-react'
import type { WeatherCache } from '@/types'
import { Card } from '@/components/ui/Card'
import { windDirectionLabel } from '@/lib/utils'

interface WeatherWidgetProps {
  weather: WeatherCache
  label?: string
}

function WeatherIcon({ temp }: { temp: number }) {
  if (temp >= 25) return <span className="text-5xl">☀️</span>
  if (temp >= 20) return <span className="text-5xl">⛅</span>
  if (temp >= 15) return <span className="text-5xl">🌤️</span>
  return <span className="text-5xl">☁️</span>
}

export function WeatherWidget({ weather, label = 'Vandaag' }: WeatherWidgetProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[#f9fafb]">{Math.round(weather.temp_max)}°</span>
            <span className="text-lg text-[#6b7280] mb-1">{Math.round(weather.temp_min)}°</span>
          </div>
          <p className="text-sm text-[#9ca3af] mt-1">Voelt als {Math.round(weather.feels_like)}°C</p>
        </div>
        <WeatherIcon temp={weather.temp_max} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Sun size={14} className="text-amber-400" />
          <span className="text-xs text-[#9ca3af]">{weather.sun_hours} zonuren</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-blue-400" />
          <span className="text-xs text-[#9ca3af]">{weather.rain_probability}% regen</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={14} className="text-[#9ca3af]" />
          <span className="text-xs text-[#9ca3af]">{weather.wind_speed_kmh} km/u {windDirectionLabel(weather.wind_direction)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-purple-400" />
          <span className="text-xs text-[#9ca3af]">UV {weather.uv_index} · Zonsondg {weather.sunset_time}</span>
        </div>
      </div>
    </Card>
  )
}
