import { Typography } from '@mui/material'

import { SwipeAction } from 'react-swipeable-list'
import DeleteIcon from '@mui/icons-material/Delete'

type Item<T> = T & { _id?: string }

interface CustomSwipeActionProps<T> {
  item: Item<T>
  onAction: (item: Item<T>) => void
  trailing?: boolean
  leading?: boolean
  main?: boolean
  icon?: React.ReactNode
  text?: string
  destructive?: boolean
  className?: string
}

export function CustomSwipeAction<T>({
  item,
  onAction,
  trailing,
  leading,
  main,
  icon,
  text,
  className,
  destructive = false,
}: CustomSwipeActionProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extraProps = { trailing, leading, main } as any
  return (
    <SwipeAction
      destructive={destructive}
      onClick={() => onAction(item)}
      {...extraProps}
    >
      <div className={`swipeable-left-action ${className}`}>
        <div className="swipeable-left-action-icon">{icon}</div>
        <Typography variant="body2">{text}</Typography>
      </div>
    </SwipeAction>
  )
}
