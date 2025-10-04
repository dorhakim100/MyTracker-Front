import { Typography } from '@mui/material'

import { SwipeAction } from 'react-swipeable-list'
import DeleteIcon from '@mui/icons-material/Delete'

type Item<T> = T & { _id?: string }

interface DeleteActionProps<T> {
  item: Item<T>
  onDeleteItem: (item: Item<T>) => void
}

export function DeleteAction<T>({ item, onDeleteItem }: DeleteActionProps<T>) {
  return (
    <SwipeAction destructive={true} onClick={() => onDeleteItem(item)}>
      <div className='swipeable-right-action delete'>
        <DeleteIcon className='delete-icon-button' />
        <Typography variant='body2'>Delete</Typography>
      </div>
    </SwipeAction>
  )
}
