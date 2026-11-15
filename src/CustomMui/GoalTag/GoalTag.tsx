import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { ActivityTag } from '../../types/health/Activity'

interface GoalTagProps {
  target: ActivityTag
  label?: string
}

export function GoalTag({ target, label }: GoalTagProps) {
  const { t } = useTranslation()

  return (
    <Chip
      className={`goal-tag-container ${target}`}
      label={label ?? t(`goal.${target}`)}
      size='small'
    />
  )
}
