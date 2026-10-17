import type { ReactNode } from 'react'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export interface StatCardItem {
  id: string
  label: string
  value: ReactNode
  onOpen?: () => void
}

interface StatCardsProps {
  cards: StatCardItem[]
}

export function StatCards({ cards }: StatCardsProps) {
  return (
    <div className='stat-cards'>
      {cards.map((card) => (
        <div
          key={card.id}
          className={`stat-card ${card.onOpen ? 'is-openable' : ''}`}
          onClick={card.onOpen}
        >
          <span className='stat-label'>{card.label}</span>
          <span className='stat-value'>{card.value}</span>
          {card.onOpen && (
            <ChevronRightIcon
              className='stat-chevron'
              fontSize='small'
            />
          )}
        </div>
      ))}
    </div>
  )
}
