import Holidays from 'date-holidays'

const nlHolidays = new Holidays('NL')
const deNrwHolidays = new Holidays('DE', 'NW')
const beHolidays = new Holidays('BE')

export function isNlHoliday(dateStr: string): boolean {
  return nlHolidays.isHoliday(new Date(dateStr)) !== false
}

export function isDeHoliday(dateStr: string): boolean {
  return deNrwHolidays.isHoliday(new Date(dateStr)) !== false
}

export function isBeHoliday(dateStr: string): boolean {
  return beHolidays.isHoliday(new Date(dateStr)) !== false
}

export function getNlHolidayName(dateStr: string): string | null {
  const result = nlHolidays.isHoliday(new Date(dateStr))
  if (!result) return null
  const r = Array.isArray(result) ? result[0] : result
  return (r as { name: string }).name ?? null
}

export function getDeHolidayName(dateStr: string): string | null {
  const result = deNrwHolidays.isHoliday(new Date(dateStr))
  if (!result) return null
  const r = Array.isArray(result) ? result[0] : result
  return (r as { name: string }).name ?? null
}

// Rough Dutch school holiday periods (summer, spring break, autumn, christmas)
export function isNlSchoolHoliday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Zomervakantie: roughly mid-July through August
  if (month === 7 && day >= 13) return true
  if (month === 8) return true
  if (month === 9 && day <= 1) return true

  // Voorjaarsvakantie (mei): typically week 18-19
  // Herfstvakantie (oktober): week 43
  // Kerstvakantie: last week of December, first week of January
  if (month === 12 && day >= 22) return true
  if (month === 1 && day <= 7) return true

  return false
}

// German NRW school holiday periods
export function isDeNrwSchoolHoliday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Sommerferien NRW: roughly late June through early August
  if (month === 6 && day >= 24) return true
  if (month === 7) return true
  if (month === 8 && day <= 6) return true

  // Herbstferien: ~2 weeks in October
  // Weihnachtsferien
  if (month === 12 && day >= 23) return true
  if (month === 1 && day <= 6) return true

  return false
}

export function getHolidayFlags(dateStr: string, distanceToGermanBorderKm: number) {
  return {
    isNlHoliday: isNlHoliday(dateStr),
    isDeHoliday: isDeHoliday(dateStr),
    isBeHoliday: isBeHoliday(dateStr),
    isNlSchoolHoliday: isNlSchoolHoliday(dateStr),
    isDeSchoolHoliday: isDeNrwSchoolHoliday(dateStr),
    nlHolidayName: getNlHolidayName(dateStr),
    deHolidayName: getDeHolidayName(dateStr),
    isGermanRelevant: distanceToGermanBorderKm < 150,
  }
}
