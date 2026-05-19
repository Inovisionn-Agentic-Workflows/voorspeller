import { clamp } from './utils'
import type { WeatherInput, ScoreSet } from '../types'

export function calcTerraceWeatherScore(w: WeatherInput): number {
  let score = 0

  if (w.tempMax >= 25) score = 95
  else if (w.tempMax >= 20) score = 75
  else if (w.tempMax >= 15) score = 40
  else score = 0

  if (w.windSpeedKmh > 35) score -= 35
  else if (w.windSpeedKmh > 20) score -= 15

  if (w.rainMm > 2) score -= 40
  else if (w.rainProbability > 60) score -= 20

  if (w.sunHours > 6) score += 10

  return clamp(score, 0, 100)
}

export function calcCocktailWeatherIndex(w: WeatherInput): number {
  const base = (w.tempMax - 18) * 4 + w.sunHours * 3 - w.rainProbability * 0.5
  return clamp(Math.round(base), 0, 100)
}

export function calcAperolIndex(w: WeatherInput, germanVisitorProb: number): number {
  const cocktailIndex = calcCocktailWeatherIndex(w)
  let multiplier = 1
  if (['S', 'SW', 'SE'].includes(w.windDirection)) multiplier = 1.2
  if (germanVisitorProb > 60) multiplier += 0.15
  return clamp(Math.round(cocktailIndex * multiplier), 0, 100)
}

export function calcBeachVibeScore(w: WeatherInput): number {
  let score = 0
  score += clamp((w.tempMax - 15) * 4, 0, 40)
  score += clamp(w.sunHours * 4, 0, 25)
  score += clamp((10 - w.windSpeedKmh / 3), 0, 15)
  score += clamp(w.uvIndex * 2, 0, 15)
  score += clamp((100 - w.cloudCoverPct) / 5, 0, 5)
  return clamp(Math.round(score), 0, 100)
}

export function calcBBQPotential(w: WeatherInput): number {
  let score = calcBeachVibeScore(w)
  if (w.windSpeedKmh > 25) score -= 20
  if (w.rainMm > 1) score -= 30
  return clamp(score, 0, 100)
}

export function calcSunsetTrafficScore(w: WeatherInput): number {
  const sunsetHour = parseInt(w.sunsetTime?.split(':')[0] ?? '21')
  const isGoodSunsetTime = sunsetHour >= 20
  const baseScore = calcBeachVibeScore(w)
  return clamp(isGoodSunsetTime ? Math.round(baseScore * 1.1) : Math.round(baseScore * 0.7), 0, 100)
}

export function calcOutdoorSeatingPotential(w: WeatherInput): number {
  return calcTerraceWeatherScore(w)
}

export function calcGermanVisitorProbability(
  dateStr: string,
  isDeHoliday: boolean,
  isDeSchoolHoliday: boolean,
  distanceToGermanBorderKm: number
): number {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDay()
  const isWeekend = day === 0 || day === 6

  let score = 0

  if (distanceToGermanBorderKm < 50) score += 30
  else if (distanceToGermanBorderKm < 100) score += 20
  else if (distanceToGermanBorderKm < 150) score += 10

  if (isDeHoliday) score += 30
  if (isDeSchoolHoliday) score += 25
  if (isWeekend) score += 15

  if (month >= 6 && month <= 8) score += 20
  else if (month === 5 || month === 9) score += 10

  return clamp(score, 0, 100)
}

export function calcHolidayBoostFactor(
  isNlHoliday: boolean,
  isDeHoliday: boolean,
  isBeHoliday: boolean,
  isNlSchoolHoliday: boolean,
  distanceToGermanBorderKm: number,
  dateStr: string
): number {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1

  let factor = 1.0

  if (isNlHoliday) factor *= 1.4
  if (isDeHoliday && distanceToGermanBorderKm < 150) factor *= 1.3
  if (isBeHoliday) factor *= 1.1
  if (isNlSchoolHoliday && (month >= 6 && month <= 8)) factor *= 1.35

  return Math.min(factor, 2.5)
}

export function calcGermanTourismFactor(germanVisitorProb: number): number {
  return 1 + (germanVisitorProb / 100) * 0.4
}

export function calcWaterRecreationImpact(w: WeatherInput): number {
  let score = 0
  if (w.tempMax >= 22) score += 40
  else if (w.tempMax >= 18) score += 20
  if (w.windSpeedKmh < 20) score += 20
  if (w.rainMm === 0) score += 20
  if (w.uvIndex >= 5) score += 20
  return clamp(score, 0, 100)
}

export function calcAllScores(
  w: WeatherInput,
  dateStr: string,
  isDeHoliday: boolean,
  isDeSchoolHoliday: boolean,
  isNlHoliday: boolean,
  isBeHoliday: boolean,
  isNlSchoolHoliday: boolean,
  distanceToGermanBorderKm: number,
  hasMinimalHistoricalData: boolean
): ScoreSet {
  const germanVisitorProbability = calcGermanVisitorProbability(
    dateStr, isDeHoliday, isDeSchoolHoliday, distanceToGermanBorderKm
  )

  return {
    terraceWeatherScore: calcTerraceWeatherScore(w),
    beachVibeScore: calcBeachVibeScore(w),
    germanVisitorProbability,
    cocktailWeatherIndex: calcCocktailWeatherIndex(w),
    aperolIndex: calcAperolIndex(w, germanVisitorProbability),
    bbqPotential: calcBBQPotential(w),
    sunsetTrafficScore: calcSunsetTrafficScore(w),
    outdoorSeatingPotential: calcOutdoorSeatingPotential(w),
    waterRecreationImpact: calcWaterRecreationImpact(w),
    holidayBoostFactor: calcHolidayBoostFactor(
      isNlHoliday, isDeHoliday, isBeHoliday, isNlSchoolHoliday, distanceToGermanBorderKm, dateStr
    ),
    germanTourismFactor: calcGermanTourismFactor(germanVisitorProbability),
    confidenceScore: hasMinimalHistoricalData ? 72 : 35,
  }
}

export function calcPredictedRevenue(
  baselineRevenue: number,
  scores: ScoreSet
): number {
  const weatherMod = 1 + (scores.terraceWeatherScore - 50) / 100
  return Math.round(baselineRevenue * scores.holidayBoostFactor * scores.germanTourismFactor * weatherMod)
}
