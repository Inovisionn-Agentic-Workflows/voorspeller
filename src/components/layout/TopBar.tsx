import { MapPin, RefreshCw, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useLocationStore } from '@/stores/locationStore'
import { useAuth } from '@/hooks/useAuth'

export function TopBar() {
  const now = new Date()
  const dateStr = format(now, 'EEEE d MMMM yyyy', { locale: nl })
  const capitalised = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
  const { activeLocation } = useLocationStore()
  const { signOut } = useAuth()

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-[#1f2937] flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
        <MapPin size={14} className="text-blue-400" />
        <span className="font-medium text-[#f9fafb]">
          {activeLocation?.name ?? 'Beach Club Sunset'}
        </span>
        <span className="text-[#4b5563]">·</span>
        <span>{capitalised}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
        <button className="p-1.5 rounded-lg hover:bg-[#1f2937] transition-colors text-[#9ca3af] hover:text-[#f9fafb]">
          <RefreshCw size={14} />
        </button>
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg hover:bg-[#1f2937] transition-colors text-[#9ca3af] hover:text-red-400"
          title="Uitloggen"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}
