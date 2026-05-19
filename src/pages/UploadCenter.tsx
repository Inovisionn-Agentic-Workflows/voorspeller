import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { parseCSV, parseExcel } from '@/lib/fileParser'
import type { ParsedSummary } from '@/lib/fileParser'
import { formatCurrency } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'parsing' | 'done' | 'error'
  summary?: ParsedSummary
  error?: string
}

export default function UploadCenter() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(async (accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      status: 'parsing',
    }))
    setFiles(prev => [...prev, ...newFiles])

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i]
      const entry = newFiles[i]
      try {
        let summary: ParsedSummary
        if (file.name.endsWith('.csv')) {
          summary = await parseCSV(file)
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          summary = await parseExcel(file)
        } else {
          throw new Error('PDF bestanden worden verwerkt via de server (Supabase Edge Function).')
        }
        setFiles(prev =>
          prev.map(f => f.id === entry.id ? { ...f, status: 'done', summary } : f)
        )
      } catch (err) {
        setFiles(prev =>
          prev.map(f => f.id === entry.id ? { ...f, status: 'error', error: String(err) } : f)
        )
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  })

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f9fafb]">Upload Center</h1>
        <p className="text-sm text-[#9ca3af] mt-1">Upload kassarapporten voor AI-analyse en forecasting</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-[#1f2937] hover:border-blue-500/50 hover:bg-[#111827]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-2xl ${isDragActive ? 'bg-blue-500/20' : 'bg-[#1f2937]'}`}>
            <Upload size={28} className={isDragActive ? 'text-blue-400' : 'text-[#9ca3af]'} />
          </div>
          <div>
            <p className="text-[#f9fafb] font-medium">
              {isDragActive ? 'Laat bestand los...' : 'Drag & drop je kassabestanden hier'}
            </p>
            <p className="text-sm text-[#9ca3af] mt-1">of klik om te bladeren</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">CSV</Badge>
            <Badge variant="default">Excel (.xlsx)</Badge>
            <Badge variant="default">PDF</Badge>
          </div>
        </div>
      </div>

      {/* Supported formats info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { format: 'CSV', icon: '📄', desc: 'Exporteer uit je kassasysteem als CSV. Kolommen zoals datum, product, aantal en bedrag worden automatisch herkend.' },
          { format: 'Excel', icon: '📊', desc: 'Excel-rapporten van Lightspeed, Orderbird of eigen systemen. Meerdere tabbladen worden ondersteund.' },
          { format: 'PDF', icon: '📋', desc: 'PDF-kasrapporten worden via AI verwerkt. Vergt Supabase koppeling voor server-verwerking.' },
        ].map(item => (
          <Card key={item.format} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-[#f9fafb]">{item.format}</span>
            </div>
            <p className="text-xs text-[#9ca3af]">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Geüploade bestanden</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="p-4 rounded-xl bg-[#0d1321] border border-[#1f2937]">
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-[#9ca3af] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#f9fafb] truncate">{file.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {file.status === 'parsing' && (
                          <Loader2 size={14} className="text-blue-400 animate-spin" />
                        )}
                        {file.status === 'done' && (
                          <CheckCircle size={14} className="text-emerald-400" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle size={14} className="text-red-400" />
                        )}
                        <button onClick={() => removeFile(file.id)} className="text-[#6b7280] hover:text-[#f9fafb]">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b7280] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>

                    {file.status === 'parsing' && (
                      <p className="text-xs text-blue-400 mt-2">Bestand wordt verwerkt...</p>
                    )}

                    {file.status === 'error' && (
                      <p className="text-xs text-red-400 mt-2">{file.error}</p>
                    )}

                    {file.status === 'done' && file.summary && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-[#111827] rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-[#f9fafb]">{file.summary.totalRows}</p>
                          <p className="text-[10px] text-[#6b7280]">Rijen</p>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-[#f9fafb]">{formatCurrency(file.summary.totalRevenue)}</p>
                          <p className="text-[10px] text-[#6b7280]">Totale omzet</p>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-[#f9fafb]">{file.summary.dateRangeStart}</p>
                          <p className="text-[10px] text-[#6b7280]">Startdatum</p>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-[#f9fafb]">{file.summary.dateRangeEnd}</p>
                          <p className="text-[10px] text-[#6b7280]">Einddatum</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hoe werkt het?</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Upload je kassabestand', desc: 'CSV of Excel export uit je kassasysteem. Minimaal 4 weken data voor goede forecasts.' },
            { step: '2', title: 'AI analyseert automatisch', desc: 'BeachBrain herkent producten, categorieën, omzet en tijdspatronen automatisch.' },
            { step: '3', title: 'Forecasts worden gegenereerd', desc: 'Op basis van jouw historische data + weerdata + feestdagen worden dagelijkse forecasts berekend.' },
            { step: '4', title: 'AI inzichten verschijnen', desc: 'Patronen zoals "bij warm weer stijgt Aperol-verkoop" worden automatisch gedetecteerd.' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-400">{item.step}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#f9fafb]">{item.title}</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
