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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}
