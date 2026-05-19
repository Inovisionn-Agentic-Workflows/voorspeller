import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { demoForecasts, demoProductSales } from '@/lib/demoData'
import { formatCurrency } from '@/lib/utils'
import type { ProductCategory } from '@/types'

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  cocktail: '#a855f7',
  bier: '#f59e0b',
  wijn: '#ec4899',
  spirits: '#6366f1',
  frisdrank: '#06b6d4',
  food_snacks: '#f97316',
  food_main: '#10b981',
  food_dessert: '#8b5cf6',
  overig: '#6b7280',
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cocktail: 'Cocktails',
  bier: 'Bier',
  wijn: 'Wijn',
  spirits: 'Spirits',
  frisdrank: 'Frisdrank',
  food_snacks: 'Snacks',
  food_main: 'Hoofdgerechten',
  food_dessert: 'Desserts',
  overig: 'Overig',
}

export default function ProductForecast() {
  const today = demoForecasts[0]
  const weekend = demoForecasts.filter(f => {
    const d = new Date(f.date).getDay()
    return d === 5 || d === 6 || d === 0
  })

  // Category breakdown from historical
  const categoryTotals = demoProductSales.reduce<Record<string, { revenue: number; quantity: number }>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { revenue: 0, quantity: 0 }
    acc[p.category].revenue += p.revenue
    acc[p.category].quantity += p.quantity
    return acc
  }, {})

  const pieData = Object.entries(categoryTotals).map(([cat, val]) => ({
    name: CATEGORY_LABELS[cat as ProductCategory] ?? cat,
    value: val.revenue,
    color: CATEGORY_COLORS[cat as ProductCategory] ?? '#6b7280',
  }))

  const topProductsWeekend = weekend.flatMap(f => f.predicted_top_products)
    .reduce<Record<string, { quantity: number; revenue: number }>>((acc, p) => {
      if (!acc[p.product]) acc[p.product] = { quantity: 0, revenue: 0 }
      acc[p.product].quantity += p.quantity
      acc[p.product].revenue += p.revenue
      return acc
    }, {})

  const weekendRanking = Object.entries(topProductsWeekend)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([product, v]) => ({ product, ...v }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Product Forecast</h1>
        <p className="text-sm text-[#9ca3af] mt-1">Verwachte productverkoop en voorraadadvies</p>
      </div>

      {/* Today's top products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top producten vandaag</CardTitle>
            <Badge variant="accent">AI voorspelling</Badge>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {today.predicted_top_products.map((p, i) => (
            <div key={p.product} className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#4b5563] w-6 text-right">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#f9fafb]">{p.product}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#9ca3af]">{p.quantity} stuks</span>
                    <span className="text-sm font-bold text-[#f9fafb]">{formatCurrency(p.revenue)}</span>
                  </div>
                </div>
                <div className="w-full bg-[#1f2937] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(p.revenue / today.predicted_top_products[0].revenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Omzet per categorie (gisteren)</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Omzet']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekend top products bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top producten dit weekend</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekendRanking} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `€${(v / 1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="product" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ background: '#1a2234', border: '1px solid #1f2937', borderRadius: 12, color: '#f9fafb' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Verwachte omzet']}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#a855f7" fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Inventory advice */}
      <Card>
        <CardHeader>
          <CardTitle>Voorraadadvies komend weekend</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { product: 'Aperol Spritz', advies: '+30% inkopen', impact: 'hoog', qty: '±180 porties' },
            { product: 'Rosé (fles)', advies: '+25% inkopen', impact: 'hoog', qty: '±65 flessen' },
            { product: 'Peroni Bucket', advies: '+20% inkopen', impact: 'gemiddeld', qty: '±80 buckets' },
            { product: 'Prosecco', advies: 'Standaard', impact: 'laag', qty: '±24 flessen' },
            { product: 'Loaded Fries', advies: '+15% inkopen', impact: 'gemiddeld', qty: '±120 porties' },
            { product: 'Beach Burger', advies: '+10% inkopen', impact: 'gemiddeld', qty: '±90 stuks' },
          ].map(item => (
            <div key={item.product} className="p-3 rounded-xl bg-[#0d1321] border border-[#1f2937]">
              <p className="text-sm font-medium text-[#f9fafb]">{item.product}</p>
              <p className="text-xs text-[#9ca3af] mt-0.5">{item.qty}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant={item.impact === 'hoog' ? 'warning' : item.impact === 'gemiddeld' ? 'accent' : 'default'}>
                  {item.impact}
                </Badge>
                <span className="text-xs font-medium text-emerald-400">{item.advies}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
