'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, children, hover, padding = 'md', border = true, shadow = 'sm' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl',
        border && 'border border-slate-100',
        shadows[shadow],
        paddings[padding],
        hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size])}>
      {children}
    </span>
  )
}

interface AlertProps {
  type: 'danger' | 'warning' | 'info' | 'success'
  title: string
  description?: string
  icon?: string
  className?: string
}

export function AlertCard({ type, title, description, icon, className }: AlertProps) {
  const styles = {
    danger: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }

  return (
    <div className={cn('border rounded-xl p-4', styles[type], className)}>
      <div className="flex gap-3">
        {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
        <div>
          <p className="font-semibold text-sm">{title}</p>
          {description && <p className="text-sm mt-1 opacity-80">{description}</p>}
        </div>
      </div>
    </div>
  )
}
