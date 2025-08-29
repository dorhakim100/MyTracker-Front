import React from 'react'

import { Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

interface GoalBannerProps {
  current: number
  goal: number
}

export function GoalBanner({ current, goal }: GoalBannerProps) {
  return (
    <div className='goal-banner banner'>
      <Typography variant='body1'>
        {current}/{goal}
      </Typography>
      <FlagIcon />
    </div>
  )
}
