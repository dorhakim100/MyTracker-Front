import React, { useEffect, useState } from 'react'

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
  DragStart,
} from '@hello-pangea/dnd'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

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
  onReorder?: (next: T[]) => void
  noResultsMessage?: string
  // onDragStart?: (result: DragStart) => void
  /** Optional vertical offset to apply to the dragging clone (in px). Can be negative. */
  dragOffsetY?: number
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
  noResultsMessage,

  onReorder,
  dragOffsetY = 0,
}: // onDragStart,
CustomListProps<T>) {
  const [reorderedItems, setReorderedItems] = useState<T[]>(items || [])

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  useEffect(() => {
    setReorderedItems([...items])
  }, [items])

  const leadingActions = (item: T) =>
    renderLeftSwipeActions ? (
      <LeadingActions>{renderLeftSwipeActions(item)}</LeadingActions>
    ) : null

  const trailingActions = (item: T) =>
    renderRightSwipeActions ? (
      <TrailingActions>{renderRightSwipeActions(item)}</TrailingActions>
    ) : null

  // const onDragEnd = (result: DropResult) => {
  //   if (!dragEnd) return
  //   dragEnd(result)
  // }

  const onDragEnd = ({ destination, source }: DropResult) => {
    if (!destination || destination.index === source.index) return
    const newItems = [...items]
    const [moved] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, moved)
    setReorderedItems(newItems)
    onReorder?.(newItems)
  }

  const onDragStart = (result: DragStart) => {
    console.log(result)
  }

  const renderList = (item: T, dragProvided: DraggableProvided) => {
    return (
      <ListItemButton
        className={`custom-list-item ${itemClassName ? itemClassName : ''}`}
        onClick={onItemClick ? () => onItemClick(item) : undefined}
      >
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
        {isDragable && (
          <span
            {...dragProvided.dragHandleProps}
            className='drag-handle'
            onClick={(e) => e.stopPropagation()}
          >
            ⋮⋮
          </span>
        )}
      </ListItemButton>
    )
  }

  if (!reorderedItems.length) {
    console.log('no results', noResultsMessage)

    return (
      <div className='no-results-container'>
        <span>{noResultsMessage}</span>
      </div>
    )
  }

  return (
    <div className={`custom-list ${className ? className : ''}`}>
      <List>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <Droppable droppableId='droppable'>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {reorderedItems.map((item, index) => {
                  const key = getKey ? getKey(item, index) : index
                  // const draggableId = String(key)
                  const draggableId = key + ''

                  return (
                    <Draggable
                      key={draggableId}
                      draggableId={draggableId}
                      index={index}
                      isDragDisabled={!isDragable}
                    >
                      {(dragProvided, snapshot) => {
                        // Quick fix for dragging offset

                        const baseStyle =
                          dragProvided.draggableProps.style || {}
                        const style: React.CSSProperties = { ...baseStyle }
                        if (snapshot.isDragging && dragOffsetY) {
                          const currentTransform = style.transform as
                            | string
                            | undefined
                          const extra = ` translateY(${dragOffsetY}px)`
                          style.transform = currentTransform
                            ? `${currentTransform}${extra}`
                            : `translateY(${dragOffsetY}px)`
                        }

                        return (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={style}
                            className={`${
                              snapshot.isDragging ? 'dragging' : ''
                            } ${prefs.favoriteColor}`}
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
                        )
                      }}
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
