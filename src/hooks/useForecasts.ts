import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { demoForecasts } from '@/lib/demoData'
import type { Forecast } from '@/types'

export function useForecasts(days = 14) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['forecasts', activeLocation?.id, days],
    queryFn: async () => {
      if (!activeLocation) return demoForecasts

      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('location_id', activeLocation.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(days)
      if (error) throw error
      return (data as Forecast[]).length > 0 ? (data as Forecast[]) : demoForecasts
    },
    placeholderData: demoForecasts,
    staleTime: 1000 * 60 * 30,
  })
}
