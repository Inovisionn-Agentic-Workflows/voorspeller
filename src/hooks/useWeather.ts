import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { demoWeather } from '@/lib/demoData'
import type { WeatherCache } from '@/types'

export function useWeather(days = 14) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['weather', activeLocation?.id, days],
    queryFn: async () => {
      if (!activeLocation) return demoWeather

      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location_id', activeLocation.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(days)
      if (error) throw error
      return (data as WeatherCache[]).length > 0 ? (data as WeatherCache[]) : demoWeather
    },
    placeholderData: demoWeather,
    staleTime: 1000 * 60 * 60,
  })
}
