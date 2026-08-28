import type { ReactNode } from 'react'
import { Badge } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { formatUnreadCount } from '../../services/message/unread-summary.store'

interface ChatUnreadBadgeProps {
  count: number
  hasMessages?: boolean
  children?: ReactNode
  className?: string
  variant?: 'overlay' | 'inline'
}

export function ChatUnreadBadge({
  count,
  hasMessages = false,
  children,
  className = '',
  variant = 'overlay',
}: ChatUnreadBadgeProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const badgeContent = formatUnreadCount(count)
  const colorClass = prefs.favoriteColor || ''

  if (variant === 'inline') {
    if (!badgeContent) return null
    return (
      <span className={`chat-unread-badge inline ${colorClass} ${className}`}>
        {badgeContent}
      </span>
    )
  }

  if (badgeContent) {
    return (
      <Badge
        badgeContent={badgeContent}
        overlap='circular'
        className={`chat-unread-badge ${colorClass} ${className}`}
      >
        {children || <span className='chat-unread-badge-anchor' />}
      </Badge>
    )
  }

  if (hasMessages) {
    return (
      <Badge
        variant='dot'
        overlap='circular'
        className={`chat-unread-badge seen ${colorClass} ${className}`}
      >
        {children || <span className='chat-unread-badge-anchor' />}
      </Badge>
    )
  }

  return children || <span className='chat-unread-badge-anchor' />
}
