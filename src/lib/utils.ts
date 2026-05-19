import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('nl-NL').format(Math.round(n))
}

export function formatPct(n: number): string {
  return `${n > 0 ? '+' : ''}${Math.round(n)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Uitstekend'
  if (score >= 65) return 'Goed'
  if (score >= 45) return 'Matig'
  if (score >= 25) return 'Slecht'
  return 'Zeer slecht'
}

export function windDirectionLabel(dir: string): string {
  const map: Record<string, string> = {
    N: 'Noord', NE: 'Noordoost', E: 'Oost', SE: 'Zuidoost',
    S: 'Zuid', SW: 'Zuidwest', W: 'West', NW: 'Noordwest',
  }
  return map[dir] ?? dir
}

export function dayOfWeekNl(dateStr: string): string {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  return days[new Date(dateStr).getDay()]
}

export function shortDayNl(dateStr: string): string {
  const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
  return days[new Date(dateStr).getDay()]
}

export function formatDateNl(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  })
}

export function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6
}
