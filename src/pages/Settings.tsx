import { MapPin, Key, Bell, Database } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Instellingen</h1>
        <p className="text-sm text-[#9ca3af] mt-1">Configureer locaties, API koppelingen en meldingen</p>
      </div>

      {/* Location settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" />
            <CardTitle>Locatie</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Naam locatie</label>
            <input
              type="text"
              defaultValue="Beach Club Sunset"
              className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Stad</label>
              <input
                type="text"
                defaultValue="Cadzand-Bad"
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Type</label>
              <select className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors">
                <option value="beach_club">Beach Club</option>
                <option value="terras">Terras</option>
                <option value="water">Waterlocatie</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Afstand tot Duitse grens (km)</label>
            <input
              type="number"
              defaultValue="25"
              className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
            Opslaan
          </button>
        </div>
      </Card>

      {/* API settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key size={16} className="text-amber-400" />
            <CardTitle>API Koppelingen</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          {[
            { label: 'Supabase URL', key: 'VITE_SUPABASE_URL', status: 'niet gekoppeld', placeholder: 'https://xxx.supabase.co' },
            { label: 'Supabase Anon Key', key: 'VITE_SUPABASE_ANON_KEY', status: 'niet gekoppeld', placeholder: 'eyJ...' },
            { label: 'OpenWeather API Key', key: 'OPENWEATHER_API_KEY', status: 'niet gekoppeld', placeholder: 'abc123...' },
            { label: 'OpenAI API Key', key: 'OPENAI_API_KEY', status: 'niet gekoppeld', placeholder: 'sk-...' },
          ].map(item => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">{item.label}</label>
                <Badge variant={item.status === 'gekoppeld' ? 'success' : 'warning'}>{item.status}</Badge>
              </div>
              <input
                type="password"
                placeholder={item.placeholder}
                className="w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4b5563]"
              />
              <p className="text-[10px] text-[#6b7280] mt-1">Sla op in je <code className="text-blue-400">.env</code> bestand als <code className="text-blue-400">{item.key}</code></p>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-emerald-400" />
            <CardTitle>Meldingen</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {[
            { label: 'WhatsApp melding bij drukte verwachting', desc: 'Ontvang een WhatsApp bericht wanneer morgen een drukke dag verwacht wordt' },
            { label: 'Dagelijkse forecast samenvatting', desc: 'Elke ochtend om 07:00 een overzicht van de dag' },
            { label: 'Voorraad waarschuwingen', desc: 'Melding wanneer voorraad onder bestelpunt komt' },
            { label: 'Weerswaarschuwingen', desc: 'Melding bij sterk weer dat impact heeft op terras' },
          ].map(item => (
            <div key={item.label} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#0d1321]">
              <div>
                <p className="text-sm font-medium text-[#f9fafb]">{item.label}</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">{item.desc}</p>
              </div>
              <button className="shrink-0 w-10 h-6 bg-[#1f2937] rounded-full relative transition-colors hover:bg-blue-500/30">
                <div className="w-4 h-4 bg-[#6b7280] rounded-full absolute top-1 left-1 transition-all" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database size={16} className="text-purple-400" />
            <CardTitle>Data beheer</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1321]">
            <div>
              <p className="text-sm font-medium text-[#f9fafb]">Demo data</p>
              <p className="text-xs text-[#9ca3af]">Gebruikt nu gesimuleerde demo data</p>
            </div>
            <Badge variant="accent">Demo</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1321]">
            <div>
              <p className="text-sm font-medium text-[#f9fafb]">Forecast ververs interval</p>
              <p className="text-xs text-[#9ca3af]">Hoe vaak forecasts worden bijgewerkt</p>
            </div>
            <select className="bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-1.5 text-xs text-[#f9fafb]">
              <option>Dagelijks 06:00</option>
              <option>Elke 6 uur</option>
              <option>Elk uur</option>
            </select>
          </div>
          <button className="w-full py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors">
            Alle data wissen
          </button>
        </div>
      </Card>
    </div>
  )
}
