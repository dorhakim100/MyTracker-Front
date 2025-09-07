import React, { useState } from 'react'

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

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
} from '@hello-pangea/dnd'

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
  isDragable?: boolean
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
  isDragable = false,
}: CustomListProps<T>) {
  const [isSwiping, setIsSwiping] = useState(false)

  const leadingActions = (item: T) =>
    renderLeftSwipeActions ? (
      <LeadingActions>{renderLeftSwipeActions(item)}</LeadingActions>
    ) : null

  const trailingActions = (item: T) =>
    renderRightSwipeActions ? (
      <TrailingActions>{renderRightSwipeActions(item)}</TrailingActions>
    ) : null

  const onDragEnd = (result: DropResult) => {
    console.log(result)
  }

  const onDragStart = (result) => {
    console.log(result)
  }

  const renderList = (item: T, dragProvided: DraggableProvided) => {
    return (
      <ListItemButton
        className={`custom-list-item ${itemClassName ? itemClassName : ''}`}
        onClick={onItemClick ? () => onItemClick(item) : undefined}
      >
        {isDragable && (
          <span
            {...dragProvided.dragHandleProps}
            className='drag-handle'
            style={{
              cursor: 'grab',
              paddingRight: 8,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            ⋮⋮
          </span>
        )}
        {renderLeft ? (
          <div className='left-content'>{renderLeft(item)}</div>
        ) : null}
        <ListItemText
          primary={renderPrimaryText ? renderPrimaryText(item) : undefined}
          secondary={
            renderSecondaryText ? renderSecondaryText(item) : undefined
          }
        />
        {renderRight ? (
          <div
            className='right-content'
            onClick={
              onRightClick
                ? (event) => {
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
    )
  }

  return (
    <div className={`custom-list ${className ? className : ''}`}>
      <List>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <Droppable droppableId='droppable'>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {items.map((item, index) => {
                  const key = getKey ? getKey(item, index) : index
                  const draggableId = String(key)
                  return (
                    <Draggable
                      key={draggableId}
                      draggableId={draggableId}
                      index={index}
                      isDragDisabled={!isDragable}
                    >
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                        >
                          <SwipeableList type={Type.IOS} fullSwipe={true}>
                            <SwipeableListItem
                              leadingActions={
                                isSwipeable && leadingActions(item)
                              }
                              trailingActions={
                                isSwipeable && trailingActions(item)
                              }
                              scrollStartThreshold={20}
                              threshold={0.25}
                              blockSwipe={!isSwipeable}
                            >
                              {renderList(item, dragProvided)}
                            </SwipeableListItem>
                          </SwipeableList>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
    </div>
  )
}
