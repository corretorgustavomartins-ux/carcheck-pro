'use client'

import { cn } from '@/lib/utils'

interface PlateInputProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  loading?: boolean
  error?: string
  size?: 'md' | 'lg'
}

export function PlateInput({ value, onChange, onSearch, loading, error, size = 'lg' }: PlateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (raw.length <= 7) {
      // Formato visual: ABC-1D23
      if (raw.length > 3) {
        onChange(raw.slice(0, 3) + '-' + raw.slice(3))
      } else {
        onChange(raw)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch()
    }
  }

  const displayValue = value

  return (
    <div className="space-y-2">
      <div className={cn(
        'relative group',
        error && 'shake'
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-20 group-focus-within:opacity-40 transition-opacity" />
        <div className={cn(
          'relative flex items-center bg-white border-2 rounded-2xl overflow-hidden shadow-sm',
          error ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-500',
          'transition-all duration-200'
        )}>
          {/* Badge BR */}
          <div className="flex-shrink-0 bg-blue-700 flex flex-col items-center justify-center px-3 py-2 self-stretch">
            <span className="text-yellow-400 font-black text-xs tracking-wider">BR</span>
            <div className="flex gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full opacity-60" />
              ))}
            </div>
          </div>

          {/* Input */}
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="ABC-1D23"
            maxLength={8}
            className={cn(
              'flex-1 bg-transparent border-none outline-none font-bold tracking-[0.3em] text-slate-900 uppercase placeholder:text-slate-300 placeholder:tracking-[0.2em]',
              size === 'lg' ? 'px-4 py-4 text-3xl' : 'px-3 py-3 text-xl'
            )}
          />

          {/* Right icon */}
          <div className="pr-4">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1.5 pl-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
}
