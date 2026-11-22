import { useTranslation } from 'react-i18next'
import { noResultsNs } from './locals'
import './locals'

interface NoResultsProps {
  text?: string
}

export function NoResults({ text }: NoResultsProps) {
  const { t } = useTranslation(noResultsNs)

  return (
    <div className='workout-no-results'>
      <p className='workout-no-results-text'>{text || t('noExercisesFound')}</p>
    </div>
  )
}
