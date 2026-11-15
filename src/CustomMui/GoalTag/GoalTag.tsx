import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { GoalTarget } from '../../types/health/Activity'

interface GoalTagProps {
  target: GoalTarget
}

export function GoalTag({ target }: GoalTagProps) {
  const { t } = useTranslation()

  return (
    <Chip
      className={`goal-tag-container ${target}`}
      label={t(`goal.${target}`)}
      size='small'
    />
  )
}
