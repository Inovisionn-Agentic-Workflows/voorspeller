import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { demoInsights } from '@/lib/demoData'
import type { AIInsight } from '@/types'

export function useAIInsights() {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['ai_insights', activeLocation?.id],
    queryFn: async () => {
      if (!activeLocation) return demoInsights

      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('location_id', activeLocation.id)
        .gte('valid_until', today)
        .order('confidence', { ascending: false })
        .limit(20)
      if (error) throw error
      return (data as AIInsight[]).length > 0 ? (data as AIInsight[]) : demoInsights
    },
    placeholderData: demoInsights,
  })
}
