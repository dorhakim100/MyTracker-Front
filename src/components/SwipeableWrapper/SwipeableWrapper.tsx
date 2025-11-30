import React from 'react'
import {
  SwipeableList,
  SwipeableListItem,
  Type,
  LeadingActions,
  TrailingActions,
} from 'react-swipeable-list'

import './styles/SwipeableWrapper.scss'

export interface SwipeableItem {
  id: string | number
  content: React.ReactNode
  renderRightSwipeActions?: () => React.ReactNode
  renderLeftSwipeActions?: () => React.ReactNode
}

export interface SwipeableWrapperProps {
  children?: React.ReactNode
  items?: SwipeableItem[]
  renderRightSwipeActions?: () => React.ReactNode
  renderLeftSwipeActions?: () => React.ReactNode
  className?: string
  listKey?: string | number
  threshold?: number
  scrollStartThreshold?: number
}

export function SwipeableWrapper({
  children,
  items,
  renderRightSwipeActions,
  renderLeftSwipeActions,
  className,
  listKey,
  threshold = 0.15,
  scrollStartThreshold = 20,
}: SwipeableWrapperProps) {
  // List mode: render multiple items
  if (items && items.length > 0) {
    return (
      <SwipeableList
        type={Type.IOS}
        fullSwipe={true}
        className={className}
        key={listKey}
      >
        {items.map((item) => {
          const leadingActions = item.renderLeftSwipeActions ? (
            <LeadingActions>{item.renderLeftSwipeActions()}</LeadingActions>
          ) : renderLeftSwipeActions ? (
            <LeadingActions>{renderLeftSwipeActions()}</LeadingActions>
          ) : null

          const trailingActions = item.renderRightSwipeActions ? (
            <TrailingActions>{item.renderRightSwipeActions()}</TrailingActions>
          ) : renderRightSwipeActions ? (
            <TrailingActions>{renderRightSwipeActions()}</TrailingActions>
          ) : null

          return (
            <SwipeableListItem
              key={item.id}
              leadingActions={leadingActions}
              trailingActions={trailingActions}
              scrollStartThreshold={scrollStartThreshold}
              threshold={threshold}
            >
              {item.content}
            </SwipeableListItem>
          )
        })}
      </SwipeableList>
    )
  }

  // Single item mode: wrap a single child
  const leadingActions = renderLeftSwipeActions ? (
    <LeadingActions>{renderLeftSwipeActions()}</LeadingActions>
  ) : null

  const trailingActions = renderRightSwipeActions ? (
    <TrailingActions>{renderRightSwipeActions()}</TrailingActions>
  ) : null

  return (
    <SwipeableList type={Type.IOS} fullSwipe={true} className={className}>
      <SwipeableListItem
        leadingActions={leadingActions}
        trailingActions={trailingActions}
        scrollStartThreshold={scrollStartThreshold}
        threshold={threshold}
      >
        {children}
      </SwipeableListItem>
    </SwipeableList>
  )
}
