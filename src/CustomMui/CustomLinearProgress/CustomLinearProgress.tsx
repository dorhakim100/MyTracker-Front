import React from 'react'
import { LinearProgress, Typography } from '@mui/material'

interface CustomLinearProgressProps {
  value: number
  color?: string
  leftValue?: string
  rightValue?: string
  header?: string
}

export default function CustomLinearProgress({
  value,
  color = 'black',
  leftValue,
  rightValue,
  header,
}: CustomLinearProgressProps) {
  return (
    <div className='linear-progress-container'>
      <div className='header-container'>
        <Typography variant='body1'>{header}</Typography>
      </div>
      {leftValue && <Typography variant='body2'>{leftValue}</Typography>}
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
      {rightValue && <Typography variant='body2'>{rightValue}</Typography>}
    </div>
  )
}
