import noResultsArt from '../../../assets/empty/no-results.png'

interface EmptyStateProps {
  text: string
}

export function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className='item-search-empty'>
      <img
        src={noResultsArt}
        alt=''
        className='item-search-empty-art'
        draggable={false}
      />
      <p className='item-search-empty-text'>{text}</p>
    </div>
  )
}
