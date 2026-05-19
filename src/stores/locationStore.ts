import { create } from 'zustand'
import type { Location } from '../types'

interface LocationStore {
  activeLocation: Location | null
  locations: Location[]
  setActiveLocation: (location: Location) => void
  setLocations: (locations: Location[]) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  activeLocation: null,
  locations: [],
  setActiveLocation: (location) => set({ activeLocation: location }),
  setLocations: (locations) => set({ locations }),
}))
