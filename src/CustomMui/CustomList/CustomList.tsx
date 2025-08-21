import React from 'react'

import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

export interface CustomListProps<T> {
  items: T[]
  getKey?: (item: T, index: number) => string | number
  renderLeft?: (item: T) => React.ReactNode
  renderPrimaryText?: (item: T) => React.ReactNode
  renderSecondaryText?: (item: T) => React.ReactNode
  onItemClick?: (item: T) => void
  className?: string
  itemClassName?: string
}

export function CustomList<T>({
  items,
  getKey,
  renderLeft,
  renderPrimaryText,
  renderSecondaryText,
  onItemClick,
  className,
  itemClassName,
}: CustomListProps<T>) {
  return (
    <div className={`custom-list ${className ? className : ''}`}>
      <List>
        {items.map((item, index) => {
          const key = getKey ? getKey(item, index) : index
          return (
            <ListItemButton
              key={key}
              className={`custom-list-item ${
                itemClassName ? itemClassName : ''
              }`}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
            >
              {renderLeft ? (
                <div className='left-content'>{renderLeft(item)}</div>
              ) : null}
              <ListItemText
                primary={
                  renderPrimaryText ? renderPrimaryText(item) : undefined
                }
                secondary={
                  renderSecondaryText ? renderSecondaryText(item) : undefined
                }
              />
            </ListItemButton>
          )
        })}
      </List>
    </div>
  )
}
