import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/stores/locationStore'
import type { Location } from '@/types'

export function useLocations() {
  const { setLocations, setActiveLocation, activeLocation } = useLocationStore()

  const query = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Location[]
    },
  })

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setLocations(query.data)
      if (!activeLocation) setActiveLocation(query.data[0])
    }
  }, [query.data, activeLocation, setLocations, setActiveLocation])

  return query
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  const { setActiveLocation } = useLocationStore()

  return useMutation({
    mutationFn: async (location: Omit<Location, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')
      const { data, error } = await supabase
        .from('locations')
        .insert({ ...location, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Location
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setActiveLocation(data)
    },
  })
}
