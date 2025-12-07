import { Typography } from '@mui/material'

import { SwipeAction } from 'react-swipeable-list'
import DeleteIcon from '@mui/icons-material/Delete'

type Item<T> = T & { _id?: string }

interface DeleteActionProps<T> {
  item: Item<T>
  onDeleteItem: (item: Item<T>) => void
  trailing?: boolean
  leading?: boolean
  main?: boolean
  destructive?: boolean
}

export function DeleteAction<T>({
  item,
  onDeleteItem,
  trailing,
  leading,
  main,
  destructive = true,
}: DeleteActionProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extraProps = { trailing, leading, main } as any

  return (
    <SwipeAction
      destructive={destructive}
      onClick={() => onDeleteItem(item)}
      {...extraProps}
    >
      <div className='swipeable-right-action delete'>
        <DeleteIcon className='delete-icon-button' />
        <Typography variant='body2'>Delete</Typography>
      </div>
    </SwipeAction>
  )
}
