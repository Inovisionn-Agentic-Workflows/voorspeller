export interface Location {
  id: string
  user_id: string
  name: string
  city: string
  latitude: number
  longitude: number
  type: 'beach_club' | 'terras' | 'water'
  distance_to_german_border_km: number
  created_at: string
}

export interface Upload {
  id: string
  location_id: string
  file_name: string
  file_type: 'csv' | 'excel' | 'pdf'
  storage_path: string
  status: 'pending' | 'processing' | 'done' | 'error'
  parsed_rows: number | null
  date_range_start: string | null
  date_range_end: string | null
  created_at: string
}

export interface DailySales {
  id: string
  location_id: string
  date: string
  total_revenue: number
  total_transactions: number
  total_guests: number
  avg_spend_per_guest: number
  food_revenue: number
  drinks_revenue: number
  cocktail_revenue: number
  terrace_occupancy_pct: number
  staff_cost: number
  created_at: string
}

export interface HourlySales {
  id: string
  location_id: string
  date: string
  hour: number
  revenue: number
  transactions: number
}

export interface ProductSales {
  id: string
  location_id: string
  date: string
  product_name: string
  category: 'cocktail' | 'bier' | 'wijn' | 'spirits' | 'frisdrank' | 'food_snacks' | 'food_main' | 'food_dessert' | 'overig'
  quantity: number
  revenue: number
}

export interface WeatherCache {
  id: string
  location_id: string
  date: string
  temp_max: number
  temp_min: number
  feels_like: number
  sun_hours: number
  rain_mm: number
  rain_probability: number
  wind_speed_kmh: number
  wind_direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
  uv_index: number
  cloud_cover_pct: number
  humidity_pct: number
  sunset_time: string
  is_forecast: boolean
  fetched_at: string
}

export interface PredictedProduct {
  product: string
  quantity: number
  revenue: number
}

export interface Forecast {
  id: string
  location_id: string
  date: string
  predicted_revenue: number
  predicted_guests: number
  predicted_transactions: number
  confidence_score: number
  terrace_weather_score: number
  beach_vibe_score: number
  german_visitor_probability: number
  cocktail_weather_index: number
  aperol_index: number
  bbq_potential: number
  sunset_traffic_score: number
  outdoor_seating_potential: number
  holiday_boost_factor: number
  german_tourism_factor: number
  recommended_staff: number
  predicted_top_products: PredictedProduct[]
  created_at: string
}

export interface AIInsight {
  id: string
  location_id: string
  insight_text: string
  insight_type: 'revenue' | 'product' | 'staff' | 'weather' | 'holiday'
  impact_pct: number
  confidence: number
  valid_from: string
  valid_until: string
  created_at: string
}

export interface ScoreSet {
  terraceWeatherScore: number
  beachVibeScore: number
  germanVisitorProbability: number
  cocktailWeatherIndex: number
  aperolIndex: number
  bbqPotential: number
  sunsetTrafficScore: number
  outdoorSeatingPotential: number
  waterRecreationImpact: number
  holidayBoostFactor: number
  germanTourismFactor: number
  confidenceScore: number
}

export interface WeatherInput {
  tempMax: number
  tempMin: number
  feelsLike: number
  sunHours: number
  rainMm: number
  rainProbability: number
  windSpeedKmh: number
  windDirection: string
  uvIndex: number
  cloudCoverPct: number
  sunsetTime: string
  date: string
}

export type InsightType = AIInsight['insight_type']
export type ProductCategory = ProductSales['category']
