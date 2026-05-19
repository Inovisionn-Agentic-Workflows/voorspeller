import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { ProductCategory } from '../types'

export interface ParsedRow {
  date: string
  product_name: string
  category: ProductCategory
  quantity: number
  revenue: number
}

export interface ParsedSummary {
  rows: ParsedRow[]
  dateRangeStart: string
  dateRangeEnd: string
  totalRevenue: number
  totalRows: number
  detectedColumns: string[]
}

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  cocktail: ['aperol', 'hugo', 'mojito', 'spritz', 'cocktail', 'daiquiri', 'margarita', 'cosmopolitan'],
  bier: ['bier', 'beer', 'peroni', 'heineken', 'amstel', 'radler', 'bucket', 'pils'],
  wijn: ['wijn', 'wine', 'rosé', 'rose', 'prosecco', 'champagne', 'rood', 'wit'],
  spirits: ['whisky', 'vodka', 'gin', 'rum', 'shot', 'longdrink', 'tequila'],
  frisdrank: ['cola', 'spa', 'fanta', 'juice', 'sap', 'water', 'limonade', 'ice tea'],
  food_snacks: ['fries', 'friet', 'nachos', 'snack', 'bitterballen', 'chips', 'loaded'],
  food_main: ['burger', 'wrap', 'salade', 'pizza', 'pasta', 'bbq', 'gerecht', 'menu'],
  food_dessert: ['ijs', 'ice cream', 'dessert', 'taart', 'cake', 'brownie'],
  overig: [],
}

function detectCategory(productName: string): ProductCategory {
  const lower = productName.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ProductCategory, string[]][]) {
    if (cat === 'overig') continue
    if (keywords.some(kw => lower.includes(kw))) return cat
  }
  return 'overig'
}

function normalizeDate(raw: string): string {
  // Try common Dutch date formats: dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split(/[-/]/)
    return `${y}-${m}-${d}`
  }
  const parsed = new Date(raw)
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0]
  return raw
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): ParsedRow | null {
  const keys = Object.keys(row).map(k => k.toLowerCase())

  const dateKey = Object.keys(row).find(k =>
    ['datum', 'date', 'dag', 'day'].includes(k.toLowerCase())
  )
  const productKey = Object.keys(row).find(k =>
    ['product', 'artikel', 'item', 'naam', 'name', 'omschrijving'].includes(k.toLowerCase())
  )
  const qtyKey = Object.keys(row).find(k =>
    ['aantal', 'qty', 'quantity', 'hoeveelheid', 'stuks'].includes(k.toLowerCase())
  )
  const revenueKey = Object.keys(row).find(k =>
    ['omzet', 'revenue', 'bedrag', 'amount', 'totaal', 'total', 'prijs', 'price'].includes(k.toLowerCase())
  )

  if (!dateKey || !productKey) return null

  const date = normalizeDate(String(row[dateKey]))
  const product_name = String(row[productKey]).trim()
  const quantity = qtyKey ? parseFloat(String(row[qtyKey]).replace(',', '.')) || 1 : 1
  const revenue = revenueKey ? parseFloat(String(row[revenueKey]).replace(/[€,]/g, '').replace(',', '.')) || 0 : 0

  if (!product_name || !date) return null

  return {
    date,
    product_name,
    category: detectCategory(product_name),
    quantity: Math.round(quantity),
    revenue,
  }

  void keys // suppress unused warning
}

export async function parseCSV(file: File): Promise<ParsedSummary> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (results.data as Record<string, any>[])
          .map(mapRow)
          .filter(Boolean) as ParsedRow[]

        resolve(buildSummary(rows, results.meta.fields ?? []))
      },
      error: reject,
    })
  })
}

export async function parseExcel(file: File): Promise<ParsedSummary> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)
  const rows = data.map(mapRow).filter(Boolean) as ParsedRow[]
  const fields = data.length > 0 ? Object.keys(data[0]) : []
  return buildSummary(rows, fields)
}

function buildSummary(rows: ParsedRow[], fields: string[]): ParsedSummary {
  if (rows.length === 0) {
    return { rows: [], dateRangeStart: '', dateRangeEnd: '', totalRevenue: 0, totalRows: 0, detectedColumns: fields }
  }

  const dates = rows.map(r => r.date).sort()
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0)

  return {
    rows,
    dateRangeStart: dates[0],
    dateRangeEnd: dates[dates.length - 1],
    totalRevenue,
    totalRows: rows.length,
    detectedColumns: fields,
  }
}
