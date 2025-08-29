import React from 'react'
import { LinearProgress, Typography } from '@mui/material'

interface CustomLinearProgressProps {
  value: number
  color?: string
  currentValue?: string
  goalValue?: string
  header?: string
}

export function CustomLinearProgress({
  value,
  color = 'black',
  currentValue,
  goalValue,
  header,
}: CustomLinearProgressProps) {
  return (
    <div className='linear-progress-container'>
      <div className='header-container'>
        <Typography variant='body1'>{header}</Typography>
      </div>
      <LinearProgress
        variant='determinate'
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,

          backgroundColor: 'lightgray',

          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
      {currentValue && goalValue && (
        <div className='value-container'>
          <Typography variant='body2'>{currentValue}</Typography>
          <span>/</span>
          <Typography variant='body2'>{goalValue}</Typography>
        </div>
      )}
    </div>
  )
}
