import { ReactNode, useRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { DropResult } from '@hello-pangea/dnd'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
interface CustomBasicListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  getKey?: (item: T, index: number) => string | number
  className?: string
  containerClassName?: string
  emptyMessage?: string
  onReorder?: (items: T[]) => void
}

export function CustomBasicList<T>({
  items,
  renderItem,
  getKey,
  className = '',
  containerClassName = '',
  emptyMessage,
  onReorder,
}: CustomBasicListProps<T>) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isRtl = prefs.lang === 'he'

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Store the initial height when items change
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const height = containerRef.current.offsetHeight
      if (height > 0) {
        setContainerHeight(height)
      }
    }
  }, [items, isDragging])

  if (items.length === 0 && emptyMessage) {
    return (
      <div className={`custom-basic-list-empty ${className}`}>
        <span>{emptyMessage}</span>
      </div>
    )
  }

  const onDragStart = () => {
    setIsDragging(true)
    if (containerRef.current) {
      const height = containerRef.current.offsetHeight
      if (height > 0) {
        setContainerHeight(height)
      }
    }
  }

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false)
    if (!onReorder) return
    const newItems = [...items]
    const [moved] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination?.index || 0, 0, moved)
    onReorder(newItems)
  }

  const isHorizontal = isDashboard
  const isHorizontalRtl = isHorizontal && isRtl

  return (
    <DragDropContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Droppable
        droppableId='droppable'
        direction={isHorizontal ? 'horizontal' : 'vertical'}
      >
        {(provided) => (
          <div
            ref={(node) => {
              provided.innerRef(node)
              containerRef.current = node
            }}
            {...provided.droppableProps}
            dir={isHorizontalRtl ? 'rtl' : undefined}
            className={`custom-basic-list-container ${containerClassName} ${
              prefs.isDarkMode ? 'dark-mode' : ''
            } ${isHorizontalRtl ? 'horizontal-rtl' : ''}`}
            style={{
              ...(isDragging && containerHeight !== null
                ? {
                    height: `${containerHeight}px`,
                    minHeight: `${containerHeight}px`,
                  }
                : {}),
            }}
          >
            {items.map((item, index) => (
              <Draggable
                key={getKey ? getKey(item, index) : index}
                draggableId={getKey ? getKey(item, index) + '' : index + ''}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''} ${prefs.favoriteColor}`}
                  >
                    {renderItem(item, index)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
