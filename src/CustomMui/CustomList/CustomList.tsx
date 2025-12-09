import React, { useEffect, useRef, useState } from 'react'

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
import { SkeletonList } from '../../components/SkeletonList/SkeletonList'
import CircularProgress from '@mui/material/CircularProgress'

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
  isSwipeable?: boolean | ((item: T) => boolean)
  renderRightSwipeActions?: (item: T) => React.ReactNode
  renderLeftSwipeActions?: (item: T) => React.ReactNode
  isDragable?: boolean
  onReorder?: (next: T[]) => void
  noResultsMessage?: string
  // onDragStart?: (result: DragStart) => void
  /** Optional vertical offset to apply to the dragging clone (in px). Can be negative. */
  dragOffsetY?: number
  isDefaultLoader?: boolean
  onLoadMore?: () => Promise<void>
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
  onLoadMore,
  onReorder,
  dragOffsetY = 0,
  isDefaultLoader = true,
}: // onDragStart,
CustomListProps<T>) {
  const [reorderedItems, setReorderedItems] = useState<T[]>(items || [])

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )

  const listContainerRef = useRef<HTMLDivElement>(null)
  const [isLoadingMoreItems, setIsLoadingMoreItems] = useState<boolean>(false)

  useEffect(() => {
    setReorderedItems([...items])
  }, [items])

  useEffect(() => {
    const handleScroll = () => {
      if (listContainerRef.current) {
        const scrollTop = listContainerRef.current.scrollTop
        const scrollHeight = listContainerRef.current.scrollHeight
        const clientHeight = listContainerRef.current.clientHeight
        if (scrollTop + clientHeight >= scrollHeight) {
          handleLoadMore()
        }
      }
    }

    if (listContainerRef.current) {
      listContainerRef.current.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (listContainerRef.current) {
        listContainerRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [items, listContainerRef.current])

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

  async function handleLoadMore() {
    if (!onLoadMore) return
    try {
      setIsLoadingMoreItems(true)
      await onLoadMore()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingMoreItems(false)
    }
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
  if (isDefaultLoader && isLoading) {
    return (
      <div className={`custom-list ${className ? className : ''}`}>
        <SkeletonList />
      </div>
    )
  }

  if (!reorderedItems.length) {
    return (
      <div className='no-results-container'>
        <span>{noResultsMessage}</span>
      </div>
    )
  }

  return (
    <div
      className={`custom-list ${className ? className : ''}`}
      ref={listContainerRef}
    >
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
                                blockSwipe={
                                  typeof isSwipeable === 'function'
                                    ? !isSwipeable(item)
                                    : !isSwipeable
                                }
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
        {isLoadingMoreItems && (
          <div className='loading-more-items-container'>
            {/* <CircularProgress /> */}
            <SkeletonList SKELETON_NUMBER={3} />
          </div>
        )}
      </List>
    </div>
  )
}
