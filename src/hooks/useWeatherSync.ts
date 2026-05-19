import { useQuery } from '@tanstack/react-query'
import { fetchWeatherForecast, saveWeatherToSupabase } from '@/lib/weatherApi'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'

export function useWeatherSync() {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['weather_sync', activeLocation?.id],
    queryFn: async () => {
      if (!activeLocation) return []
      const weather = await fetchWeatherForecast(
        activeLocation.id,
        activeLocation.latitude,
        activeLocation.longitude,
      )
      await saveWeatherToSupabase(weather, supabase)
      return weather
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!activeLocation,
  })
}
