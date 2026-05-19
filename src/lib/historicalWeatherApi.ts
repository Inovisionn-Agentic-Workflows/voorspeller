import type { WeatherCache } from '@/types'

const ROERMOND_LAT = 51.1944
const ROERMOND_LON = 5.9877

interface OpenMeteoDay {
  time: string
  temperature_2m_max: number
  temperature_2m_min: number
  apparent_temperature_max: number
  precipitation_sum: number
  precipitation_probability_max: number
  wind_speed_10m_max: number
  wind_direction_10m_dominant: number
  sunshine_duration: number   // seconden
  uv_index_max: number
  cloud_cover_mean: number
  relative_humidity_2m_max: number
  sunset: string              // ISO string "2024-06-15T21:32"
}

interface OpenMeteoResponse {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    apparent_temperature_max: number[]
    precipitation_sum: number[]
    precipitation_probability_max: number[]
    wind_speed_10m_max: number[]
    wind_direction_10m_dominant: number[]
    sunshine_duration: number[]
    uv_index_max: number[]
    cloud_cover_mean: number[]
    relative_humidity_2m_max: number[]
    sunset: string[]
  }
}

function degToDirection(deg: number): WeatherCache['wind_direction'] {
  const dirs: WeatherCache['wind_direction'][] = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

function sunsetToTime(isoString: string): string {
  if (!isoString) return '21:00'
  const t = isoString.split('T')[1] ?? '21:00'
  return t.slice(0, 5)
}

function buildRow(day: OpenMeteoDay, locationId: string): Omit<WeatherCache, 'id'> {
  const sunHours = Math.round((day.sunshine_duration / 3600) * 10) / 10
  return {
    location_id: locationId,
    date: day.time,
    temp_max: day.temperature_2m_max,
    temp_min: day.temperature_2m_min,
    feels_like: day.apparent_temperature_max,
    sun_hours: sunHours,
    rain_mm: day.precipitation_sum,
    rain_probability: day.precipitation_probability_max,
    wind_speed_kmh: day.wind_speed_10m_max,
    wind_direction: degToDirection(day.wind_direction_10m_dominant),
    uv_index: day.uv_index_max,
    cloud_cover_pct: Math.round(day.cloud_cover_mean),
    humidity_pct: day.relative_humidity_2m_max,
    sunset_time: sunsetToTime(day.sunset),
    is_forecast: false,
    fetched_at: new Date().toISOString(),
  }
}

export async function fetchHistoricalWeather(
  locationId: string,
  startDate: string,
  endDate: string
): Promise<Omit<WeatherCache, 'id'>[]> {
  const params = new URLSearchParams({
    latitude: String(ROERMOND_LAT),
    longitude: String(ROERMOND_LON),
    start_date: startDate,
    end_date: endDate,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'sunshine_duration',
      'uv_index_max',
      'cloud_cover_mean',
      'relative_humidity_2m_max',
      'sunset',
    ].join(','),
    timezone: 'Europe/Amsterdam',
  })

  const url = `https://archive-api.open-meteo.com/v1/archive?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo fout: ${res.status}`)
  const data: OpenMeteoResponse = await res.json()

  const days = data.daily.time.map((time, i): OpenMeteoDay => ({
    time,
    temperature_2m_max: data.daily.temperature_2m_max[i],
    temperature_2m_min: data.daily.temperature_2m_min[i],
    apparent_temperature_max: data.daily.apparent_temperature_max[i],
    precipitation_sum: data.daily.precipitation_sum[i],
    precipitation_probability_max: data.daily.precipitation_probability_max[i] ?? 0,
    wind_speed_10m_max: data.daily.wind_speed_10m_max[i],
    wind_direction_10m_dominant: data.daily.wind_direction_10m_dominant[i],
    sunshine_duration: data.daily.sunshine_duration[i] ?? 0,
    uv_index_max: data.daily.uv_index_max[i] ?? 0,
    cloud_cover_mean: data.daily.cloud_cover_mean[i] ?? 50,
    relative_humidity_2m_max: data.daily.relative_humidity_2m_max[i] ?? 60,
    sunset: data.daily.sunset[i] ?? '',
  }))

  return days.map(d => buildRow(d, locationId))
}

export async function fetchLastTwoSeasons(locationId: string): Promise<Omit<WeatherCache, 'id'>[]> {
  const today = new Date()
  const twoYearsAgo = new Date(today)
  twoYearsAgo.setFullYear(today.getFullYear() - 2)

  const start = twoYearsAgo.toISOString().split('T')[0]
  // Open-Meteo archive gaat tot gisteren
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const end = yesterday.toISOString().split('T')[0]

  return fetchHistoricalWeather(locationId, start, end)
}
