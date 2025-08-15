import React from 'react'

import { Card, Typography } from '@mui/material'

interface MacrosProgressProps {
  protein: number
  carbs: number
  fats: number
}

export function MacrosProgress({ protein, carbs, fats }: MacrosProgressProps) {
  return (
    <Card className='card macros-progress'>
      <Typography variant='h6'>Macros</Typography>
    </Card>
  )
}
