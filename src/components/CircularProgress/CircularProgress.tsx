import React from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'

interface CircularProgressProps {
  value: number
  text: string
}

export function CircularProgress({ value, text }: CircularProgressProps) {
  return (
    <div className='circular-progress'>
      <CircularProgressbar value={value} text={text} />
    </div>
  )
}
