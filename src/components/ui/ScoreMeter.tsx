'use client'

import { cn } from '@/lib/utils'
import { getScoreGradient } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ScoreMeterProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  riskLabel?: string
  riskColor?: string
}

export function ScoreMeter({ score, size = 'md', animated = true, showLabel = true, riskLabel, riskColor }: ScoreMeterProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  useEffect(() => {
    if (!animated) return
    let current = 0
    const step = score / 60
    const interval = setInterval(() => {
      current += step
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(interval)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, 16)
    return () => clearInterval(interval)
  }, [score, animated])

  const circumference = 2 * Math.PI * 45
  const progress = (displayScore / 100) * circumference
  const dashOffset = circumference - progress

  const sizes = {
    sm: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    md: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-5xl', label: 'text-base' },
  }

  const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('relative', sizes[size].container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold leading-none', sizes[size].text)} style={{ color: scoreColor }}>
            {displayScore}
          </span>
          <span className={cn('text-slate-400 font-medium', sizes[size].label)}>/100</span>
        </div>
      </div>
      {showLabel && riskLabel && (
        <div
          className="px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-sm"
          style={{ backgroundColor: riskColor || scoreColor }}
        >
          {riskLabel}
        </div>
      )}
    </div>
  )
}

interface ScoreBarProps {
  score: number
  label?: string
  showScore?: boolean
}

export function ScoreBar({ score, label, showScore = true }: ScoreBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-1.5">
      {(label || showScore) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showScore && <span className="text-sm font-semibold text-slate-800">{score}/100</span>}
        </div>
      )}
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', color)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
