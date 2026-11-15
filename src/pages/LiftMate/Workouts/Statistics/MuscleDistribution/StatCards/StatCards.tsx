import type { ReactNode } from 'react'
import { Chevron } from '../../../../../../CustomMui/Chevron/Chevron'
import { PressRipple } from '../../../../../../CustomMui/PressRipple/PressRipple'

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
        <PressRipple
          key={card.id}
          isDisabled={!card.onOpen}
        >
          <div
            className={`stat-card ${card.onOpen ? 'is-openable' : ''}`}
            onClick={card.onOpen}
          >
            <span className='stat-label'>{card.label}</span>
            <span className='stat-value'>{card.value}</span>
            {card.onOpen && (
              <Chevron
                className='stat-chevron'
                fontSize='small'
              />
            )}
          </div>
        </PressRipple>
      ))}
    </div>
  )
}
