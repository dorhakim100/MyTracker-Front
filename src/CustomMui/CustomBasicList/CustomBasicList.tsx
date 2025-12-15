import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CustomBasicListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  getKey?: (item: T, index: number) => string | number
  className?: string
  containerClassName?: string
  emptyMessage?: string
}

export function CustomBasicList<T>({
  items,
  renderItem,
  getKey,
  className = '',
  containerClassName = '',
  emptyMessage,
}: CustomBasicListProps<T>) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  if (items.length === 0 && emptyMessage) {
    return (
      <div className={`custom-basic-list-empty ${className}`}>
        <span>{emptyMessage}</span>
      </div>
    )
  }

  return (
    <div
      className={`custom-basic-list-container ${containerClassName} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      {items.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
