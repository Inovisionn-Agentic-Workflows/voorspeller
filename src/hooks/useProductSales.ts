import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import { demoProductSales } from '@/lib/demoData'
import type { ProductSales } from '@/types'

export function useProductSales(days = 30) {
  const { activeLocation } = useLocationStore()

  return useQuery({
    queryKey: ['product_sales', activeLocation?.id, days],
    queryFn: async () => {
      if (!activeLocation) return demoProductSales

      const from = new Date()
      from.setDate(from.getDate() - days)
      const { data, error } = await supabase
        .from('product_sales')
        .select('*')
        .eq('location_id', activeLocation.id)
        .gte('date', from.toISOString().split('T')[0])
        .order('date', { ascending: false })
      if (error) throw error
      return (data as ProductSales[]).length > 0 ? (data as ProductSales[]) : demoProductSales
    },
    placeholderData: demoProductSales,
  })
}
