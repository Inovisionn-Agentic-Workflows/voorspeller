import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Forecast from './pages/Forecast'
import ProductForecast from './pages/ProductForecast'
import WeatherAnalysis from './pages/WeatherAnalysis'
import AIInsights from './pages/AIInsights'
import UploadCenter from './pages/UploadCenter'
import InventoryPlanning from './pages/InventoryPlanning'
import StaffPlanning from './pages/StaffPlanning'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import { useAuth } from './hooks/useAuth'
import { useLocations } from './hooks/useLocations'
import { Brain, Loader2 } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function AppRoutes() {
  const { user, loading: authLoading } = useAuth()
  const { data: locations, isLoading: locLoading } = useLocations()

  if (authLoading || (user && locLoading)) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-amber-400 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <Loader2 size={18} className="text-[#9ca3af] animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return <Login />
  if (locations && locations.length === 0) return <Onboarding />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="product-forecast" element={<ProductForecast />} />
          <Route path="weather" element={<WeatherAnalysis />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="upload" element={<UploadCenter />} />
          <Route path="inventory" element={<InventoryPlanning />} />
          <Route path="staff" element={<StaffPlanning />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  )
}
