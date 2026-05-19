import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { fetchLastTwoSeasons, fetchHistoricalWeather } from '@/lib/historicalWeatherApi'
import type { WeatherCache } from '@/types'

// Historisch weer ophalen uit Supabase (al geïmporteerd)
export function useHistoricalWeatherFromDB(startDate: string, endDate: string) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['historical_weather', activeLocation?.id, startDate, endDate],
    queryFn: async () => {
      if (!activeLocation) return []
      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location_id', activeLocation.id)
        .eq('is_forecast', false)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
      if (error) throw error
      return data as WeatherCache[]
    },
    enabled: !!activeLocation,
  })
}

// Eenmalig historisch weer importeren (bulk upsert)
export function useImportHistoricalWeather() {
  const { activeLocation } = useLocationStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (range?: { start: string; end: string }) => {
      if (!activeLocation) throw new Error('Geen actieve locatie')

      const weatherData = range
        ? await fetchHistoricalWeather(activeLocation.id, range.start, range.end)
        : await fetchLastTwoSeasons(activeLocation.id)

      // Batch upsert in stukken van 500 — geen id meesturen, Supabase genereert die
      const batchSize = 500
      for (let i = 0; i < weatherData.length; i += batchSize) {
        const batch = weatherData.slice(i, i + batchSize)
        const { error } = await supabase
          .from('weather_cache')
          .upsert(batch as WeatherCache[], { onConflict: 'location_id,date' })
        if (error) throw error
      }

      return weatherData.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historical_weather'] })
      queryClient.invalidateQueries({ queryKey: ['weather'] })
    },
  })
}

// Combineer historisch weer met dagomzet voor correlatie-analyse
export function useWeatherSalesCorrelation(startDate: string, endDate: string) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['weather_sales_correlation', activeLocation?.id, startDate, endDate],
    queryFn: async () => {
      if (!activeLocation) return []

      const [weatherRes, salesRes] = await Promise.all([
        supabase
          .from('weather_cache')
          .select('*')
          .eq('location_id', activeLocation.id)
          .eq('is_forecast', false)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true }),
        supabase
          .from('daily_sales')
          .select('*')
          .eq('location_id', activeLocation.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true }),
      ])

      if (weatherRes.error) throw weatherRes.error
      if (salesRes.error) throw salesRes.error

      const weatherByDate = Object.fromEntries(
        (weatherRes.data as WeatherCache[]).map(w => [w.date, w])
      )

      return (salesRes.data as { date: string; total_revenue: number; cocktail_revenue: number }[])
        .map(s => ({
          date: s.date,
          revenue: s.total_revenue,
          cocktailRevenue: s.cocktail_revenue,
          tempMax: weatherByDate[s.date]?.temp_max ?? null,
          sunHours: weatherByDate[s.date]?.sun_hours ?? null,
          rainMm: weatherByDate[s.date]?.rain_mm ?? null,
          windSpeedKmh: weatherByDate[s.date]?.wind_speed_kmh ?? null,
          windDirection: weatherByDate[s.date]?.wind_direction ?? null,
        }))
        .filter(r => r.tempMax !== null)
    },
    enabled: !!activeLocation,
  })
}
