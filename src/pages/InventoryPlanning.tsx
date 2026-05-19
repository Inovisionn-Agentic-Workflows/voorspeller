import { Package, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { demoForecasts } from '@/lib/demoData'
import { formatCurrency } from '@/lib/utils'

interface InventoryItem {
  product: string
  category: string
  currentStock: number
  unit: string
  weekendDemand: number
  reorderPoint: number
  suggestedOrder: number
  estimatedCost: number
  priority: 'kritiek' | 'hoog' | 'gemiddeld' | 'ok'
}

function generateInventoryItems(): InventoryItem[] {
  const weekend = demoForecasts.filter(f => {
    const d = new Date(f.date).getDay()
    return d === 5 || d === 6 || d === 0
  })
  const avgAperol = Math.round(
    weekend.reduce((s, f) => s + (f.predicted_top_products[0]?.quantity ?? 0), 0) / weekend.length
  )

  return [
    { product: 'Aperol', category: 'Spirits', currentStock: 8, unit: 'flessen', weekendDemand: Math.ceil(avgAperol / 6), reorderPoint: 10, suggestedOrder: 24, estimatedCost: 192, priority: 'kritiek' },
    { product: 'Prosecco', category: 'Wijn', currentStock: 18, unit: 'flessen', weekendDemand: 30, reorderPoint: 15, suggestedOrder: 24, estimatedCost: 168, priority: 'hoog' },
    { product: 'Rosé (fles)', category: 'Wijn', currentStock: 12, unit: 'flessen', weekendDemand: 24, reorderPoint: 12, suggestedOrder: 24, estimatedCost: 216, priority: 'hoog' },
    { product: 'Peroni (bucket 5x)', category: 'Bier', currentStock: 22, unit: 'buckets', weekendDemand: 35, reorderPoint: 20, suggestedOrder: 24, estimatedCost: 144, priority: 'hoog' },
    { product: 'Heineken (krat)', category: 'Bier', currentStock: 4, unit: 'kratten', weekendDemand: 6, reorderPoint: 4, suggestedOrder: 8, estimatedCost: 160, priority: 'kritiek' },
    { product: 'Friet (kg)', category: 'Food', currentStock: 25, unit: 'kg', weekendDemand: 30, reorderPoint: 15, suggestedOrder: 20, estimatedCost: 60, priority: 'gemiddeld' },
    { product: 'Burgers (stuks)', category: 'Food', currentStock: 60, unit: 'stuks', weekendDemand: 80, reorderPoint: 40, suggestedOrder: 40, estimatedCost: 80, priority: 'gemiddeld' },
    { product: 'Limoenen', category: 'Garnish', currentStock: 40, unit: 'stuks', weekendDemand: 60, reorderPoint: 30, suggestedOrder: 50, estimatedCost: 12, priority: 'gemiddeld' },
    { product: 'Simpele siroop', category: 'Bar', currentStock: 6, unit: 'flessen', weekendDemand: 4, reorderPoint: 3, suggestedOrder: 0, estimatedCost: 0, priority: 'ok' },
    { product: 'Coca-Cola (blik)', category: 'Frisdrank', currentStock: 120, unit: 'blikjes', weekendDemand: 100, reorderPoint: 60, suggestedOrder: 0, estimatedCost: 0, priority: 'ok' },
  ]
}

export default function InventoryPlanning() {
  const items = generateInventoryItems()
  const totalOrderCost = items.reduce((s, i) => s + i.estimatedCost, 0)
  const criticalCount = items.filter(i => i.priority === 'kritiek').length
  const highCount = items.filter(i => i.priority === 'hoog').length

  const priorityVariant = (p: InventoryItem['priority']) => {
    if (p === 'kritiek') return 'danger' as const
    if (p === 'hoog') return 'warning' as const
    if (p === 'gemiddeld') return 'accent' as const
    return 'success' as const
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Voorraadplanning</h1>
        <p className="text-sm text-[#9ca3af] mt-1">AI-gebaseerd inkoopadvies voor komend weekend</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-xs text-[#9ca3af]">Kritieke tekorten</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-amber-400">{highCount}</p>
              <p className="text-xs text-[#9ca3af]">Hoge prioriteit</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Package size={20} className="text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-[#f9fafb]">{items.filter(i => i.suggestedOrder > 0).length}</p>
              <p className="text-xs text-[#9ca3af]">Producten te bestellen</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-[#f9fafb]">{formatCurrency(totalOrderCost)}</p>
              <p className="text-xs text-[#9ca3af]">Geschatte inkoopwaarde</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Voorraadoverzicht & besteladvies</CardTitle>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Exporteer PDF →
            </button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b7280] text-xs border-b border-[#1f2937]">
                <th className="text-left py-2 pr-4">Product</th>
                <th className="text-left py-2 pr-4">Categorie</th>
                <th className="text-right py-2 pr-4">Huidige voorraad</th>
                <th className="text-right py-2 pr-4">Weekend vraag</th>
                <th className="text-right py-2 pr-4">Besteladvies</th>
                <th className="text-right py-2 pr-4">Kosten</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {items.map(item => (
                <tr key={item.product} className={item.priority === 'kritiek' ? 'bg-red-500/5' : ''}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-[#f9fafb]">{item.product}</p>
                  </td>
                  <td className="py-3 pr-4 text-[#9ca3af]">{item.category}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={item.currentStock <= item.reorderPoint ? 'text-red-400 font-bold' : 'text-[#f9fafb]'}>
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-[#9ca3af]">±{item.weekendDemand} {item.unit}</td>
                  <td className="py-3 pr-4 text-right">
                    {item.suggestedOrder > 0 ? (
                      <span className="font-bold text-emerald-400">+{item.suggestedOrder} {item.unit}</span>
                    ) : (
                      <span className="text-[#6b7280]">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#9ca3af]">
                    {item.estimatedCost > 0 ? formatCurrency(item.estimatedCost) : '—'}
                  </td>
                  <td className="py-3">
                    <Badge variant={priorityVariant(item.priority)}>
                      {item.priority}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Smart tips */}
      <Card>
        <CardHeader>
          <CardTitle>Slimme inkooptips</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {[
            '🍊 Bestel extra Aperol — warmste weekend van de maand verwacht, historisch +52% cocktailverkoop',
            '🍾 Rosé en prosecco gaan snel bij warm weer — zorg voor koelcapaciteit',
            '🍺 Peroni Buckets populair bij Duits publiek — extra inkopen bij hoge DE kans',
            '🍋 Limoenen voor Mojito\'s en Hugo\'s gaan altijd harder bij >22°C',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[#0d1321]">
              <p className="text-sm text-[#9ca3af]">{tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
