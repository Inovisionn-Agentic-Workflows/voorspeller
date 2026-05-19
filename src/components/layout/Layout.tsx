import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useWeatherSync } from '@/hooks/useWeatherSync'
import { useLocations } from '@/hooks/useLocations'

export function Layout() {
  useLocations()        // laadt locaties + zet activeLocation
  useWeatherSync()      // haalt weerdata op bij opstarten, cached 1 uur

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <TopBar />
      <main className="ml-60 pt-14 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
