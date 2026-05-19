import { useState, type FormEvent } from 'react'
import { Brain, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (err) {
      setError(err.message)
    } else if (mode === 'register') {
      setMessage('Check je e-mail voor een bevestigingslink.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-400 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-[#f9fafb]">BeachBrain</span>
            <span className="text-xl text-amber-400 font-bold ml-1">AI</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8">
          <h1 className="text-xl font-bold text-[#f9fafb] mb-2">
            {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </h1>
          <p className="text-sm text-[#9ca3af] mb-6">
            {mode === 'login'
              ? 'Log in op je BeachBrain dashboard'
              : 'Start met forecasting voor jouw locatie'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="jou@beachclub.nl"
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4b5563]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1.5 w-full bg-[#0d1321] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4b5563]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9ca3af] mt-6">
            {mode === 'login' ? 'Nog geen account?' : 'Al een account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {mode === 'login' ? 'Aanmelden' : 'Inloggen'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-[#4b5563] mt-4">
          Jouw kassadata blijft privé en beveiligd in jouw eigen database.
        </p>
      </div>
    </div>
  )
}
