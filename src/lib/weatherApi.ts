import type { WeatherCache } from '@/types'

const DEFAULT_LAT = 51.1944 // Roermond fallback
const DEFAULT_LON = 5.9877

const API_KEY = import.meta.env.VITE_OPEN_WEATHER as string

interface OWMCurrentResponse {
  main: { temp: number; feels_like: number; humidity: number }
  wind: { speed: number; deg: number }
  clouds: { all: number }
  uvi?: number
  rain?: { '1h'?: number }
  sys: { sunset: number }
  dt: number
}

interface OWMForecastDay {
  dt: number
  temp: { max: number; min: number; day: number }
  feels_like: { day: number }
  humidity: number
  wind_speed: number
  wind_deg: number
  clouds: number
  uvi: number
  rain?: number
  pop: number
  sunshine_duration?: number
  sunrise: number
  sunset: number
}

interface OWMOneCallResponse {
  current: OWMCurrentResponse & { uvi: number }
  daily: OWMForecastDay[]
}

function degToDirection(deg: number): WeatherCache['wind_direction'] {
  const dirs: WeatherCache['wind_direction'][] = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

function unixToTime(unix: number): string {
  const d = new Date(unix * 1000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function unixToDate(unix: number): string {
  return new Date(unix * 1000).toISOString().split('T')[0]
}

// Schatting zonuren op basis van bewolking en tijdsduur
function estimateSunHours(cloudPct: number, month: number): number {
  const maxSunHours = month >= 4 && month <= 9 ? 14 : 9
  return Math.round(maxSunHours * (1 - cloudPct / 100) * 10) / 10
}

export async function fetchWeatherForecast(
  locationId: string,
  lat = DEFAULT_LAT,
  lon = DEFAULT_LON,
): Promise<WeatherCache[]> {
  if (!API_KEY) throw new Error('OpenWeather API key ontbreekt')

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) {
    return fetchWeatherForecastFree(locationId, lat, lon)
  }
  const data: OWMOneCallResponse = await res.json()

  return data.daily.slice(0, 14).map((day): WeatherCache => {
    const month = new Date(day.dt * 1000).getMonth() + 1
    const cloudPct = day.clouds
    return {
      id: `w-${day.dt}`,
      location_id: locationId,
      date: unixToDate(day.dt),
      temp_max: Math.round(day.temp.max * 10) / 10,
      temp_min: Math.round(day.temp.min * 10) / 10,
      feels_like: Math.round(day.feels_like.day * 10) / 10,
      sun_hours: estimateSunHours(cloudPct, month),
      rain_mm: Math.round((day.rain ?? 0) * 10) / 10,
      rain_probability: Math.round(day.pop * 100),
      wind_speed_kmh: Math.round(day.wind_speed * 3.6 * 10) / 10,
      wind_direction: degToDirection(day.wind_deg),
      uv_index: Math.round(day.uvi * 10) / 10,
      cloud_cover_pct: cloudPct,
      humidity_pct: day.humidity,
      sunset_time: unixToTime(day.sunset),
      is_forecast: true,
      fetched_at: new Date().toISOString(),
    }
  })
}

async function fetchWeatherForecastFree(
  locationId: string,
  lat = DEFAULT_LAT,
  lon = DEFAULT_LON,
): Promise<WeatherCache[]> {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`OpenWeather fout: ${res.status}`)
  const data = await res.json()

  // Groepeer 3-uurlijkse data per dag
  const byDate: Record<string, { temps: number[]; wind: number[]; windDeg: number[]; pop: number[]; clouds: number[]; rain: number }> = {}

  for (const item of data.list) {
    const date = unixToDate(item.dt)
    if (!byDate[date]) byDate[date] = { temps: [], wind: [], windDeg: [], pop: [], clouds: [], rain: 0 }
    byDate[date].temps.push(item.main.temp)
    byDate[date].wind.push(item.wind.speed)
    byDate[date].windDeg.push(item.wind.deg)
    byDate[date].pop.push(item.pop ?? 0)
    byDate[date].clouds.push(item.clouds.all)
    byDate[date].rain += (item.rain?.['3h'] ?? 0)
  }

  return Object.entries(byDate).slice(0, 5).map(([date, d]): WeatherCache => {
    const month = new Date(date).getMonth() + 1
    const avgCloud = Math.round(d.clouds.reduce((a, b) => a + b, 0) / d.clouds.length)
    const avgWindDeg = Math.round(d.windDeg.reduce((a, b) => a + b, 0) / d.windDeg.length)
    const avgWindKmh = Math.round(d.wind.reduce((a, b) => a + b, 0) / d.wind.length * 3.6 * 10) / 10
    return {
      id: `w-${date}`,
      location_id: locationId,
      date,
      temp_max: Math.round(Math.max(...d.temps) * 10) / 10,
      temp_min: Math.round(Math.min(...d.temps) * 10) / 10,
      feels_like: Math.round(d.temps.reduce((a, b) => a + b, 0) / d.temps.length * 10) / 10,
      sun_hours: estimateSunHours(avgCloud, month),
      rain_mm: Math.round(d.rain * 10) / 10,
      rain_probability: Math.round(Math.max(...d.pop) * 100),
      wind_speed_kmh: avgWindKmh,
      wind_direction: degToDirection(avgWindDeg),
      uv_index: 0,
      cloud_cover_pct: avgCloud,
      humidity_pct: 60,
      sunset_time: '21:00',
      is_forecast: true,
      fetched_at: new Date().toISOString(),
    }
  })
}

export async function saveWeatherToSupabase(
  weatherData: WeatherCache[],
  supabaseClient: typeof import('@/lib/supabase').supabase
) {
  const { error } = await supabaseClient
    .from('weather_cache')
    .upsert(weatherData, { onConflict: 'location_id,date' })
  if (error) throw error
}
