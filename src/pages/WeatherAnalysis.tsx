import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { Cloud, Download, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Badge } from '@/components/ui/Badge'
import { demoForecasts, demoDailySales } from '@/lib/demoData'
import { useWeather } from '@/hooks/useWeather'
import { useImportHistoricalWeather, useWeatherSalesCorrelation, useHistoricalWeatherFromDB } from '@/hooks/useHistoricalWeather'
import { format, subMonths } from 'date-fns'
import { formatDateNl, formatCurrency, windDirectionLabel } from '@/lib/utils'

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

export default function WeatherAnalysis() {
  const [tab, setTab] = useState<'forecast' | 'historisch' | 'correlatie'>('forecast')
  const [importRange, setImportRange] = useState({
    start: fmt(subMonths(new Date(), 24)),
    end: fmt(new Date()),
  })

  const { data: weather = [] } = useWeather(14)
  const importMutation = useImportHistoricalWeather()

  const { data: historicalWeather = [] } = useHistoricalWeatherFromDB(importRange.start, importRange.end)
  const { data: correlationData = [] } = useWeatherSalesCorrelation(importRange.start, importRange.end)
  const forecasts = demoForecasts
  const dailySales = demoDailySales

  const todayWeather = weather[0]
  const todayFc = forecasts[0]

  if (!todayWeather || !todayFc) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb]">Weer Analyse</h1>
          <p className="text-sm text-[#9ca3af] mt-1">Weerdata ophalen van OpenWeatherMap...</p>
        </div>
      </div>
    )
  }

  const weatherByDate = Object.fromEntries(weather.map(w => [w.date, w]))
  const forecastScores = forecasts.map(fc => {
    const w = weatherByDate[fc.date]
    return {
      label: formatDateNl(fc.date),
      terras: fc.terrace_weather_score,
      beach: fc.beach_vibe_score,
      cocktail: fc.cocktail_weather_index,
      temp: w?.temp_max ?? 0,
    }
  })

  // Demo correlatie data als Supabase leeg is
  const displayCorrelation = correlationData.length > 0
    ? correlationData
    : dailySales.slice(-30).map(d => ({
        date: d.date,
        revenue: d.total_revenue,
        cocktailRevenue: d.cocktail_revenue,
        tempMax: 15 + Math.random() * 12,
        sunHours: 2 + Math.random() * 8,
        rainMm: Math.random() * 4,
        windSpeedKmh: 8 + Math.random() * 20,
        windDirection: 'SW',
      }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb]">Weer Analyse</h1>
          <p className="text-sm text-[#9ca3af] mt-1">Live forecast + historisch weer voor Roermond gekoppeld aan omzet</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#6b7280] bg-[#111827] border border-[#1f2937] px-3 py-1.5 rounded-xl">
          <Cloud size={12} className="text-blue-400" />
          Open-Meteo · OpenWeather
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-xl p-1 w-fit">
        {(['forecast', 'historisch', 'correlatie'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-[#9ca3af] hover:text-[#f9fafb]'
            }`}
          >
            {t === 'forecast' ? '14-daagse forecast' : t === 'historisch' ? 'Historisch weer' : 'Omzet correlatie'}
          </button>
        ))}
      </div>

      {/* ---- TAB: FORECAST ---- */}
      {tab === 'forecast' && (
        <>
          {/* Today stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '🌡️', value: `${Math.round(todayWeather.temp_max)}°C`, label: 'Max temperatuur' },
              { emoji: '💨', value: `${todayWeather.wind_speed_kmh} km/u`, label: `${windDirectionLabel(todayWeather.wind_direction)}wind` },
              { emoji: '☀️', value: `${todayWeather.sun_hours}u`, label: 'Zonuren' },
              { emoji: '🌧️', value: `${todayWeather.rain_probability}%`, label: 'Regenrisico' },
            ].map(item => (
              <Card key={item.label} className="flex flex-col items-center gap-2 py-6">
                <span className="text-4xl">{item.emoji}</span>
                <span className="text-3xl font-bold text-[#f9fafb]">{item.value}</span>
                <span className="text-xs text-[#9ca3af]">{item.label}</span>
              </Card>
            ))}
          </div>

          {/* Weerscores */}
          <Card>
            <CardHeader><CardTitle>Weerscores vandaag</CardTitle></CardHeader>
            <div className="flex flex-wrap gap-6 justify-around">
              <ScoreRing score={todayFc.terrace_weather_score} size={90} label="Terras Weer" />
              <ScoreRing score={todayFc.beach_vibe_score} size={90} label="Beach Vibe" />
              <ScoreRing score={todayFc.cocktail_weather_index} size={90} label="Cocktail Index" />
              <ScoreRing score={todayFc.aperol_index} size={90} label="Aperol Index" />
              <ScoreRing score={todayFc.bbq_potential} size={90} label="BBQ Potentieel" />
              <ScoreRing score={todayFc.sunset_traffic_score} size={90} label="Zonsondergang Maas" />
            </div>
          </Card>

          {/* 14-day scores chart */}
          <Card>
            <CardHeader><CardTitle>Weerscores komende 14 dagen</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={forecastScores} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }} />
                <Legend formatter={v => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v === 'terras' ? 'Terras' : v === 'beach' ? 'Beach Vibe' : 'Cocktail'}</span>} />
                <Line type="monotone" dataKey="terras" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="beach" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cocktail" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Wind tabel */}
          <Card>
            <CardHeader><CardTitle>Wind & neerslag komende 14 dagen</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6b7280] text-xs border-b border-[#1f2937]">
                    <th className="text-left py-2 pr-4">Datum</th>
                    <th className="text-left py-2 pr-4">Temp</th>
                    <th className="text-left py-2 pr-4">Zon</th>
                    <th className="text-left py-2 pr-4">Wind</th>
                    <th className="text-left py-2 pr-4">Richting</th>
                    <th className="text-left py-2">Neerslag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {weather.map(w => (
                    <tr key={w.date}>
                      <td className="py-2 pr-4 text-[#f9fafb]">{formatDateNl(w.date)}</td>
                      <td className="py-2 pr-4">
                        <span className={w.temp_max >= 25 ? 'text-amber-400' : w.temp_max >= 20 ? 'text-emerald-400' : 'text-[#9ca3af]'}>
                          {Math.round(w.temp_max)}°C
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-[#9ca3af]">{w.sun_hours}u</td>
                      <td className="py-2 pr-4">
                        <span className={w.wind_speed_kmh > 25 ? 'text-red-400' : w.wind_speed_kmh > 15 ? 'text-amber-400' : 'text-emerald-400'}>
                          {w.wind_speed_kmh} km/u
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-[#9ca3af]">{windDirectionLabel(w.wind_direction)}</td>
                      <td className="py-2">
                        <span className={w.rain_mm > 2 ? 'text-blue-400' : 'text-[#9ca3af]'}>
                          {w.rain_probability}% · {w.rain_mm}mm
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ---- TAB: HISTORISCH ---- */}
      {tab === 'historisch' && (
        <>
          {/* Import control */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historisch weer importeren (Open-Meteo — gratis)</CardTitle>
                {importMutation.isSuccess && (
                  <Badge variant="success"><CheckCircle size={10} className="mr-1 inline" /> Geïmporteerd</Badge>
                )}
              </div>
            </CardHeader>
            <p className="text-xs text-[#9ca3af] mb-4">
              Importeer historisch weer voor Roermond en koppel het automatisch aan je kassahistorie. Open-Meteo is gratis en heeft data terug tot 1940.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-[#9ca3af] font-medium uppercase tracking-wider">Van</label>
                <input
                  type="date"
                  value={importRange.start}
                  onChange={e => setImportRange(r => ({ ...r, start: e.target.value }))}
                  className="mt-1.5 block bg-[#0d1321] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-[#9ca3af] font-medium uppercase tracking-wider">Tot</label>
                <input
                  type="date"
                  value={importRange.end}
                  onChange={e => setImportRange(r => ({ ...r, end: e.target.value }))}
                  className="mt-1.5 block bg-[#0d1321] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => importMutation.mutate({ start: importRange.start, end: importRange.end })}
                disabled={importMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {importMutation.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Bezig met importeren...</>
                  : <><Download size={14} /> Importeer weerdata</>
                }
              </button>
              <button
                onClick={() => importMutation.mutate(undefined)}
                disabled={importMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1f2937] hover:bg-[#374151] disabled:opacity-60 text-[#f9fafb] rounded-xl text-sm font-medium transition-colors"
              >
                Afgelopen 2 seizoenen
              </button>
            </div>
            {importMutation.isSuccess && (
              <p className="text-sm text-emerald-400 mt-3">{importMutation.data} dagen weerdata geïmporteerd en opgeslagen in Supabase.</p>
            )}
            {importMutation.isError && (
              <p className="text-sm text-red-400 mt-3">{importMutation.error?.message}</p>
            )}
          </Card>

          {/* Historisch weer tabel */}
          {historicalWeather.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{historicalWeather.length} dagen historisch weer voor Roermond</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#111827]">
                    <tr className="text-[#6b7280] text-xs border-b border-[#1f2937]">
                      <th className="text-left py-2 pr-4">Datum</th>
                      <th className="text-right py-2 pr-4">Temp max</th>
                      <th className="text-right py-2 pr-4">Zon</th>
                      <th className="text-right py-2 pr-4">Wind</th>
                      <th className="text-left py-2 pr-4">Richting</th>
                      <th className="text-right py-2">Neerslag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]">
                    {[...historicalWeather].reverse().map(w => (
                      <tr key={w.date}>
                        <td className="py-2 pr-4 text-[#f9fafb]">{formatDateNl(w.date)}</td>
                        <td className="py-2 pr-4 text-right">
                          <span className={w.temp_max >= 25 ? 'text-amber-400 font-medium' : w.temp_max >= 20 ? 'text-emerald-400' : 'text-[#9ca3af]'}>
                            {Math.round(w.temp_max)}°C
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-right text-[#9ca3af]">{w.sun_hours}u</td>
                        <td className="py-2 pr-4 text-right">
                          <span className={w.wind_speed_kmh > 25 ? 'text-red-400' : w.wind_speed_kmh > 15 ? 'text-amber-400' : 'text-emerald-400'}>
                            {w.wind_speed_kmh} km/u
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-[#9ca3af]">{windDirectionLabel(w.wind_direction)}</td>
                        <td className="py-2 text-right">
                          <span className={w.rain_mm > 2 ? 'text-blue-400' : 'text-[#9ca3af]'}>
                            {w.rain_mm}mm
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Cloud size={40} className="text-[#374151] mx-auto mb-3" />
                <p className="text-[#9ca3af] font-medium">Nog geen historisch weer geïmporteerd</p>
                <p className="text-xs text-[#6b7280] mt-1">Klik op "Importeer weerdata" hierboven om te starten</p>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ---- TAB: CORRELATIE ---- */}
      {tab === 'correlatie' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Temperatuur vs. Omzet</CardTitle>
                <Badge variant={correlationData.length > 0 ? 'success' : 'warning'}>
                  {correlationData.length > 0 ? 'Live data' : 'Demo data'}
                </Badge>
              </div>
            </CardHeader>
            <p className="text-xs text-[#6b7280] mb-4">
              {correlationData.length > 0
                ? `${correlationData.length} dagen met gekoppelde omzet- en weerdata`
                : 'Upload kassahistorie + importeer historisch weer om echte patronen te zien'}
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  type="number" dataKey="tempMax" name="Temperatuur" unit="°C"
                  tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  label={{ value: 'Temperatuur (°C)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 10 }}
                />
                <YAxis
                  type="number" dataKey="revenue" name="Omzet"
                  tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${(v / 1000).toFixed(1)}k`}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
                  formatter={(value, name) => [
                    name === 'Temperatuur' ? `${value}°C` : formatCurrency(Number(value)),
                    String(name),
                  ]}
                />
                <Scatter name="Omzet vs Temp" data={displayCorrelation} fill="#3b82f6" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          {/* Zonuren vs omzet */}
          <Card>
            <CardHeader>
              <CardTitle>Omzet per dag — temperatuur + zonuren overlay</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={displayCorrelation.slice(-60).map(d => ({
                  date: formatDateNl(d.date),
                  omzet: d.revenue,
                  cocktails: d.cocktailRevenue,
                  temp: d.tempMax,
                }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                <YAxis yAxisId="omzet" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 1000).toFixed(1)}k`} />
                <YAxis yAxisId="temp" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}°`} />
                <Tooltip
                  contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
                  formatter={(value, name) => [
                    name === 'temp' ? `${value}°C` : formatCurrency(Number(value)),
                    name === 'temp' ? 'Temperatuur' : name === 'omzet' ? 'Omzet' : 'Cocktails',
                  ]}
                />
                <Legend formatter={v => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v === 'temp' ? 'Temp (°C)' : v === 'omzet' ? 'Omzet' : 'Cocktails'}</span>} />
                <Line yAxisId="omzet" type="monotone" dataKey="omzet" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line yAxisId="omzet" type="monotone" dataKey="cocktails" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Bekende patronen */}
          <Card>
            <CardHeader><CardTitle>Bekende Roermond weerpatronen</CardTitle></CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { emoji: '🌡️', rule: 'Boven 23°C stijgt Aperol Spritz verkoop gemiddeld +58%', positive: true },
                { emoji: '💨', rule: 'Westwind boven 22 km/u verlaagt waterterras bezetting met -28%', positive: false },
                { emoji: '🌹', rule: 'Boven 22°C stijgt rosé verkoop met +110% op zonnige zondagen', positive: true },
                { emoji: '☀️', rule: 'Meer dan 6 zonuren levert +22% meer cocktailomzet op', positive: true },
                { emoji: '🌧️', rule: 'Meer dan 3mm regen verlaagt totale terrasomzet met -60%', positive: false },
                { emoji: '🇩🇪', rule: 'NRW feestdag + weekend = +35-50% meer Duits bezoek in Roermond', positive: true },
              ].map(r => (
                <div key={r.rule} className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1321] border border-[#1f2937]">
                  <span className="text-lg">{r.emoji}</span>
                  <p className={`text-sm ${r.positive ? 'text-emerald-300' : 'text-red-300'}`}>{r.rule}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
