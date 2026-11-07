import type { ReactNode } from 'react'

interface EllipsisTextProps {
  children: ReactNode
  className?: string
  isDisabled?: boolean
}

export function EllipsisText({
  children,
  className = '',
  isDisabled = false,
}: EllipsisTextProps) {
  const title =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined

  return (
    <div
      className={`ellipsis-text-container ${
        isDisabled ? 'disabled' : ''
      } ${className}`.trim()}
      title={isDisabled ? undefined : title}
    >
      {children}
    </div>
  )
}
