import React from 'react'

import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import {
  SwipeableList,
  SwipeableListItem,
  Type,
  LeadingActions,
  TrailingActions,
} from 'react-swipeable-list'

export interface CustomListProps<T> {
  items: T[]
  getKey?: (item: T, index: number) => string | number
  renderLeft?: (item: T) => React.ReactNode
  renderPrimaryText?: (item: T) => React.ReactNode
  renderSecondaryText?: (item: T) => React.ReactNode
  renderRight?: (item: T) => React.ReactNode
  onRightClick?: (item: T) => void
  onItemClick?: (item: T) => void
  className?: string
  itemClassName?: string
  isSwipeable?: boolean
  renderRightSwipeActions?: (item: T) => React.ReactNode
  renderLeftSwipeActions?: (item: T) => React.ReactNode
}

export function CustomList<T>({
  items,
  getKey,
  renderLeft,
  renderPrimaryText,
  renderSecondaryText,
  renderRight,
  onRightClick,
  onItemClick,
  className,
  itemClassName,
  isSwipeable = false,
  renderRightSwipeActions,
  renderLeftSwipeActions,
}: CustomListProps<T>) {
  const leadingActions = (item: T) =>
    renderLeftSwipeActions ? (
      <LeadingActions>{renderLeftSwipeActions(item)}</LeadingActions>
    ) : null

  const trailingActions = (item: T) =>
    renderRightSwipeActions ? (
      <TrailingActions>{renderRightSwipeActions(item)}</TrailingActions>
    ) : null
  return (
    <div className={`custom-list ${className ? className : ''}`}>
      <List>
        <SwipeableList type={Type.IOS} fullSwipe={true}>
          {items.map((item, index) => {
            const key = getKey ? getKey(item, index) : index
            return (
              <SwipeableListItem
                leadingActions={isSwipeable && leadingActions(item)}
                trailingActions={isSwipeable && trailingActions(item)}
                key={key}
                scrollStartThreshold={20}
                threshold={0.25}
                // fullSwipe={false}
                blockSwipe={!isSwipeable}
              >
                <ListItemButton
                  // key={key}
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
                      renderSecondaryText
                        ? renderSecondaryText(item)
                        : undefined
                    }
                  />
                  {renderRight ? (
                    <div
                      className='right-content'
                      onClick={
                        onRightClick
                          ? (event) => {
                              // console.log('right click', event)
                              event.preventDefault()
                              event.stopPropagation()
                              onRightClick(item)
                            }
                          : undefined
                      }
                    >
                      {renderRight(item)}
                    </div>
                  ) : null}
                </ListItemButton>
              </SwipeableListItem>
            )
          })}
        </SwipeableList>
      </List>
    </div>
  )
}
