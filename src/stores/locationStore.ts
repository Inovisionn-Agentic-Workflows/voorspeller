import { create } from 'zustand'
import type { Location } from '../types'

const DEFAULT_LOCATION: Location = {
  id: 'af97f210-d188-46c8-b033-279c0d13e42d',
  user_id: '27d1ef32-63ab-4e8a-b5a2-1836d9e4c8d6',
  name: 'Yacht5',
  city: 'Roermond',
  latitude: 51.1944,
  longitude: 5.9877,
  type: 'water',
  distance_to_german_border_km: 16,
  created_at: '2026-05-19T11:30:29.033158+00:00',
}

interface LocationStore {
  activeLocation: Location
  locations: Location[]
  setActiveLocation: (location: Location) => void
  setLocations: (locations: Location[]) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  activeLocation: DEFAULT_LOCATION,
  locations: [DEFAULT_LOCATION],
  setActiveLocation: (location) => set({ activeLocation: location }),
  setLocations: (locations) => set({ locations }),
}))
