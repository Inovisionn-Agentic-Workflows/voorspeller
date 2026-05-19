import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, ShoppingCart, Cloud,
  Sparkles, Upload, Package, Users, Settings, Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/product-forecast', icon: ShoppingCart, label: 'Product Forecast' },
  { to: '/weather', icon: Cloud, label: 'Weer Analyse' },
  { to: '/ai-insights', icon: Sparkles, label: 'AI Insights' },
  { to: '/upload', icon: Upload, label: 'Upload Center' },
  { to: '/inventory', icon: Package, label: 'Voorraad' },
  { to: '/staff', icon: Users, label: 'Personeel' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d1321] border-r border-[#1f2937] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1f2937]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-amber-400 flex items-center justify-center">
          <Brain size={16} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-[#f9fafb]">BeachBrain</span>
          <span className="text-xs text-amber-400 font-medium ml-1">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1f2937]'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#1f2937]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-blue-500/15 text-blue-400'
                : 'text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1f2937]'
            )
          }
        >
          <Settings size={16} />
          Instellingen
        </NavLink>
        <div className="mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-amber-500/10 border border-blue-500/10">
          <p className="text-xs text-[#9ca3af]">Demo modus</p>
          <p className="text-[10px] text-[#6b7280] mt-0.5">Koppel Supabase voor live data</p>
        </div>
      </div>
    </aside>
  )
}
