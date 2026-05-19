import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { demoDailySales, demoHourlySales } from '@/lib/demoData'
import type { DailySales } from '@/types'

export function useDailySales(days = 60) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['daily_sales', activeLocation?.id, days],
    queryFn: async () => {
      if (!activeLocation) return demoDailySales

      const from = new Date()
      from.setDate(from.getDate() - days)
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('location_id', activeLocation.id)
        .gte('date', from.toISOString().split('T')[0])
        .order('date', { ascending: true })
      if (error) throw error
      return (data as DailySales[]).length > 0 ? (data as DailySales[]) : demoDailySales
    },
    placeholderData: demoDailySales,
  })
}

export function useHourlySales(date?: string) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['hourly_sales', activeLocation?.id, date],
    queryFn: async () => {
      if (!activeLocation || !date) return demoHourlySales
      const { data, error } = await supabase
        .from('hourly_sales')
        .select('*')
        .eq('location_id', activeLocation.id)
        .eq('date', date)
        .order('hour', { ascending: true })
      if (error) throw error
      if ((data ?? []).length === 0) return demoHourlySales
      return data
    },
  })
}
