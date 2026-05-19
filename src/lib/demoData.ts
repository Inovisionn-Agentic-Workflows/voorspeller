import type { DailySales, Forecast, AIInsight, WeatherCache, ProductSales, HourlySales } from '../types'
import { addDays, format } from 'date-fns'

const today = new Date()
const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

export const DEMO_LOCATION_ID = 'demo-location-roermond'

// Roermond: terras aan water, 15km van DE grens
// Patroon: weekenden ZEER druk door Duits bezoek, zomers piekseizoen
// Omzet range: €3.500 doordeweeks laag, €9.000+ topzaterdag

export const demoDailySales: DailySales[] = Array.from({ length: 60 }, (_, i) => {
  const date = addDays(today, -(59 - i))
  const dow = date.getDay() // 0=zo, 6=za
  const month = date.getMonth() + 1

  const isWeekend = dow === 0 || dow === 6
  const isFriday = dow === 5
  const isHighSeason = month >= 5 && month <= 9

  // Roermond-specifiek: Duitsers komen veel op za/zo en feestdagen
  let base = 1800
  if (isHighSeason) base *= 1.5
  if (isWeekend) base *= 2.4
  else if (isFriday) base *= 1.6

  const variance = (Math.random() - 0.5) * base * 0.25
  const total = Math.round(Math.max(800, base + variance))

  // Roermond: hogere drank/food ratio, veel cocktails bij mooi weer
  const drinkRatio = 0.68 + Math.random() * 0.06
  const cocktailRatio = isWeekend ? 0.32 + Math.random() * 0.08 : 0.18 + Math.random() * 0.06

  return {
    id: `ds-${i}`,
    location_id: DEMO_LOCATION_ID,
    date: fmt(date),
    total_revenue: total,
    total_transactions: Math.round(total / 16),
    total_guests: Math.round(total / 20),
    avg_spend_per_guest: 20 + Math.random() * 10,
    food_revenue: Math.round(total * (1 - drinkRatio)),
    drinks_revenue: Math.round(total * drinkRatio),
    cocktail_revenue: Math.round(total * cocktailRatio),
    terrace_occupancy_pct: isWeekend
      ? Math.round(75 + Math.random() * 22)
      : Math.round(35 + Math.random() * 30),
    staff_cost: Math.round(total * 0.20),
    created_at: new Date().toISOString(),
  }
})

export const demoForecasts: Forecast[] = Array.from({ length: 14 }, (_, i) => {
  const date = addDays(today, i)
  const dow = date.getDay()
  const month = date.getMonth() + 1

  const isWeekend = dow === 0 || dow === 6
  const isFriday = dow === 5
  const isHighSeason = month >= 5 && month <= 9

  let base = isWeekend ? 7500 : isFriday ? 4200 : 2400
  if (isHighSeason) base *= 1.4
  const variance = 0.85 + Math.random() * 0.3

  // 15km van grens: Duits bezoek is standaard hoog op weekenden
  const germanProb = isWeekend
    ? Math.round(70 + Math.random() * 25)
    : Math.round(35 + Math.random() * 30)

  return {
    id: `fc-${i}`,
    location_id: DEMO_LOCATION_ID,
    date: fmt(date),
    predicted_revenue: Math.round(base * variance),
    predicted_guests: Math.round((base * variance) / 21),
    predicted_transactions: Math.round((base * variance) / 17),
    confidence_score: Math.round(68 + Math.random() * 22),
    terrace_weather_score: Math.round(55 + Math.random() * 35),
    beach_vibe_score: Math.round(50 + Math.random() * 40),
    german_visitor_probability: germanProb,
    cocktail_weather_index: Math.round(50 + Math.random() * 40),
    aperol_index: Math.round(55 + Math.random() * 40),
    bbq_potential: Math.round(45 + Math.random() * 45),
    sunset_traffic_score: Math.round(55 + Math.random() * 35),
    outdoor_seating_potential: Math.round(60 + Math.random() * 30),
    // Roermond: nabij grens verhoogt altijd de German tourism factor
    holiday_boost_factor: isWeekend ? 1.2 + Math.random() * 0.5 : 1.0 + Math.random() * 0.2,
    german_tourism_factor: 1.15 + (germanProb / 100) * 0.35,
    recommended_staff: isWeekend
      ? Math.round(10 + Math.random() * 5)
      : Math.round(5 + Math.random() * 3),
    predicted_top_products: [
      { product: 'Aperol Spritz', quantity: Math.round(55 + Math.random() * 40), revenue: Math.round(660 + Math.random() * 480) },
      { product: 'Peroni Bucket', quantity: Math.round(30 + Math.random() * 20), revenue: Math.round(450 + Math.random() * 280) },
      { product: 'Rosé (fles)', quantity: Math.round(20 + Math.random() * 15), revenue: Math.round(600 + Math.random() * 350) },
      { product: 'Hugo Spritz', quantity: Math.round(25 + Math.random() * 18), revenue: Math.round(300 + Math.random() * 200) },
      { product: 'Loaded Fries', quantity: Math.round(30 + Math.random() * 22), revenue: Math.round(240 + Math.random() * 175) },
    ],
    created_at: new Date().toISOString(),
  }
})

// Roermond: continentaal klimaat, warme zomers, droge warme periodes
export const demoWeather: WeatherCache[] = Array.from({ length: 14 }, (_, i) => {
  const date = addDays(today, i)
  const month = date.getMonth() + 1
  const isHighSeason = month >= 5 && month <= 9
  const temp = isHighSeason
    ? 19 + Math.random() * 10
    : 10 + Math.random() * 8

  return {
    id: `wc-${i}`,
    location_id: DEMO_LOCATION_ID,
    date: fmt(date),
    temp_max: Math.round(temp * 10) / 10,
    temp_min: Math.round((temp - 7) * 10) / 10,
    feels_like: Math.round((temp - 2) * 10) / 10,
    sun_hours: Math.round((isHighSeason ? 5 + Math.random() * 7 : 2 + Math.random() * 4) * 10) / 10,
    rain_mm: Math.round(Math.random() * 5 * 10) / 10,
    rain_probability: Math.round(Math.random() * 55),
    wind_speed_kmh: Math.round((8 + Math.random() * 18) * 10) / 10,
    // Roermond: wind komt vaak uit SW (Atlantisch) of ZO (continentaal warm)
    wind_direction: (['SW', 'W', 'S', 'SE', 'NW', 'NE', 'E', 'N'] as const)[Math.floor(Math.random() * 8)],
    uv_index: Math.round((isHighSeason ? 4 + Math.random() * 5 : 1 + Math.random() * 3) * 10) / 10,
    cloud_cover_pct: Math.round(Math.random() * 65),
    humidity_pct: Math.round(55 + Math.random() * 30),
    sunset_time: isHighSeason ? '21:30' : '18:00',
    is_forecast: true,
    fetched_at: new Date().toISOString(),
  }
})

// Roermond-specifieke AI inzichten (sterk Duits profiel)
export const demoInsights: AIInsight[] = [
  {
    id: 'ai-1',
    location_id: DEMO_LOCATION_ID,
    insight_text: 'Komend weekend zijn er twee grote Schlager-evenementen in de grensregio NRW — verwacht 40-55% meer Duits bezoek dan normaal.',
    insight_type: 'holiday',
    impact_pct: 48,
    confidence: 87,
    valid_from: fmt(addDays(today, 4)),
    valid_until: fmt(addDays(today, 6)),
    created_at: new Date().toISOString(),
  },
  {
    id: 'ai-2',
    location_id: DEMO_LOCATION_ID,
    insight_text: 'Aperol Spritz is jullie sterkste product bij temperaturen boven 22°C — historisch +58% verkoop op warme zaterdagen.',
    insight_type: 'product',
    impact_pct: 58,
    confidence: 82,
    valid_from: fmt(today),
    valid_until: fmt(addDays(today, 14)),
    created_at: new Date().toISOString(),
  },
  {
    id: 'ai-3',
    location_id: DEMO_LOCATION_ID,
    insight_text: 'NRW Pfingstferien begint aankomende week — verwacht 3 extra drukke dagen door Duits dagtoerisme naar Roermond.',
    insight_type: 'holiday',
    impact_pct: 35,
    confidence: 91,
    valid_from: fmt(addDays(today, 7)),
    valid_until: fmt(addDays(today, 10)),
    created_at: new Date().toISOString(),
  },
  {
    id: 'ai-4',
    location_id: DEMO_LOCATION_ID,
    insight_text: 'Wind uit het westen boven 22 km/u verlaagt terrasbezetting aan het water met gemiddeld 28% — overweeg windschermen.',
    insight_type: 'weather',
    impact_pct: -28,
    confidence: 85,
    valid_from: fmt(today),
    valid_until: fmt(addDays(today, 3)),
    created_at: new Date().toISOString(),
  },
  {
    id: 'ai-5',
    location_id: DEMO_LOCATION_ID,
    insight_text: 'Rosé verkoop stijgt sterk bij waterterras + zon combinatie — historisch 2.1x meer op zonnige zondagen vs weekdagen.',
    insight_type: 'product',
    impact_pct: 110,
    confidence: 78,
    valid_from: fmt(today),
    valid_until: fmt(addDays(today, 14)),
    created_at: new Date().toISOString(),
  },
]

// Roermond productmix: meer bucket bier (Duits publiek), veel cocktails, waterterras food
export const demoProductSales: ProductSales[] = [
  { id: 'ps-1', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Aperol Spritz', category: 'cocktail', quantity: 82, revenue: 984 },
  { id: 'ps-2', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Peroni Bucket', category: 'bier', quantity: 48, revenue: 720 },
  { id: 'ps-3', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Rosé (fles)', category: 'wijn', quantity: 28, revenue: 840 },
  { id: 'ps-4', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Hugo Spritz', category: 'cocktail', quantity: 36, revenue: 432 },
  { id: 'ps-5', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Loaded Fries', category: 'food_snacks', quantity: 54, revenue: 432 },
  { id: 'ps-6', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Mojito', category: 'cocktail', quantity: 24, revenue: 288 },
  { id: 'ps-7', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Water Burger', category: 'food_main', quantity: 42, revenue: 630 },
  { id: 'ps-8', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Heineken Bier', category: 'bier', quantity: 65, revenue: 325 },
  { id: 'ps-9', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Prosecco (fles)', category: 'wijn', quantity: 18, revenue: 540 },
  { id: 'ps-10', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), product_name: 'Sparkling Nachos', category: 'food_snacks', quantity: 38, revenue: 304 },
]

// Yacht 5 patroon: rustig voor 12u, piek 14-17u (lunch/middag), tweede piek 19-21u (zonsondergang Maas)
export const demoHourlySales: HourlySales[] = [
  { id: 'hs-0', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 10, revenue: 60, transactions: 4 },
  { id: 'hs-1', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 11, revenue: 180, transactions: 11 },
  { id: 'hs-2', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 12, revenue: 380, transactions: 24 },
  { id: 'hs-3', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 13, revenue: 620, transactions: 38 },
  { id: 'hs-4', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 14, revenue: 780, transactions: 48 },
  { id: 'hs-5', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 15, revenue: 920, transactions: 56 },
  { id: 'hs-6', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 16, revenue: 860, transactions: 52 },
  { id: 'hs-7', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 17, revenue: 740, transactions: 45 },
  { id: 'hs-8', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 18, revenue: 680, transactions: 42 },
  { id: 'hs-9', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 19, revenue: 820, transactions: 50 },  // zonsondergang Maas
  { id: 'hs-10', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 20, revenue: 760, transactions: 46 },
  { id: 'hs-11', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 21, revenue: 480, transactions: 30 },
  { id: 'hs-12', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 22, revenue: 220, transactions: 14 },
  { id: 'hs-13', location_id: DEMO_LOCATION_ID, date: fmt(addDays(today, -1)), hour: 23, revenue: 80, transactions: 5 },
]
