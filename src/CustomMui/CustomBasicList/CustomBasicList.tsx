import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { DragStart, DropResult } from '@hello-pangea/dnd'
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

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  if (items.length === 0 && emptyMessage) {
    return (
      <div className={`custom-basic-list-empty ${className}`}>
        <span>{emptyMessage}</span>
      </div>
    )
  }

  const onDragEnd = (result: DropResult) => {
    if (!onReorder) return
    const newItems = [...items]
    const [moved] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination?.index || 0, 0, moved)
    onReorder(newItems)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId='droppable'
        direction={isDashboard ? 'horizontal' : 'vertical'}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`custom-basic-list-container ${containerClassName} ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
          >
            {items.map((item, index) => (
              <Draggable
                key={getKey ? getKey(item, index) : index}
                draggableId={getKey ? getKey(item, index) + '' : index + ''}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {renderItem(item, index)}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
