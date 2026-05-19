import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { fetchWeatherForecast, saveWeatherToSupabase } from '@/lib/weatherApi'
import type { WeatherCache } from '@/types'

const ROERMOND_LAT = 51.1944
const ROERMOND_LON = 5.9877
const DEMO_LOCATION_ID = 'demo-location-roermond'

export function useWeather(days = 14) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['weather', activeLocation?.id ?? 'demo', days],
    queryFn: async (): Promise<WeatherCache[]> => {
      const locationId = activeLocation?.id ?? DEMO_LOCATION_ID
      const lat = activeLocation?.latitude ?? ROERMOND_LAT
      const lon = activeLocation?.longitude ?? ROERMOND_LON

      if (activeLocation) {
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('weather_cache')
          .select('*')
          .eq('location_id', locationId)
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(days)
        if (error) throw error

        if ((data as WeatherCache[]).length >= 3) {
          return data as WeatherCache[]
        }
      }

      // Cache leeg of demo-modus: haal live data op van OpenWeatherMap
      const live = await fetchWeatherForecast(locationId, lat, lon)
      if (activeLocation) {
        // Sla op in Supabase voor volgende keer (fire-and-forget)
        saveWeatherToSupabase(live, supabase).catch(() => undefined)
      }
      return live.slice(0, days)
    },
    staleTime: 1000 * 60 * 60,
    retry: 1,
  })
}
