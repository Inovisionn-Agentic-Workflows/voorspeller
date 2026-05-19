import { useState, type FormEvent } from 'react'
import { MapPin, Loader2, Brain } from 'lucide-react'
import { useCreateLocation } from '@/hooks/useLocations'

export default function Onboarding() {
  const createLocation = useCreateLocation()
  const [name, setName] = useState('Yacht 5')
  const [city, setCity] = useState('Roermond')
  const [type, setType] = useState<'beach_club' | 'terras' | 'water'>('water')
  const [distance, setDistance] = useState('15')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await createLocation.mutateAsync({
      name,
      city,
      type,
      latitude: 51.1944,   // Roermond
      longitude: 5.9877,
      distance_to_german_border_km: parseInt(distance) || 15,
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-400 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-[#f9fafb]">BeachBrain</span>
            <span className="text-xl text-amber-400 font-bold ml-1">AI</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-blue-400" />
            <h1 className="text-xl font-bold text-[#f9fafb]">Jouw locatie instellen</h1>
          </div>
          <p className="text-sm text-[#9ca3af] mb-6">
            BeachBrain gebruikt jouw locatiegegevens voor nauwkeurigere forecasts — zoals de kans op Duits bezoek.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Naam van je locatie</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Beach Club Sunset"
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4b5563]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Stad / Plaats</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                placeholder="Cadzand-Bad"
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4b5563]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Type locatie</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as typeof type)}
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="beach_club">🏖️ Beach Club</option>
                <option value="terras">☀️ Terras / Strandtent</option>
                <option value="water">⚓ Waterlocatie / Haven</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                Afstand tot Duitse grens (km)
              </label>
              <input
                type="number"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                min="0"
                max="500"
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-[#6b7280] mt-1">Gebruikt voor het berekenen van de German Visitor Probability score</p>
            </div>

            {createLocation.isError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{createLocation.error?.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={createLocation.isPending}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {createLocation.isPending && <Loader2 size={14} className="animate-spin" />}
              Locatie aanmaken & starten
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
