import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CircularProgressProps {
  value: number
  text: string
  color?: string
}

const defaultColor = 'var(--primary-color)'

export function CircularProgress({
  value,
  text,
  color,
}: CircularProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const progressColor = color || defaultColor

  // if color is provided, use it
  // only if dark mode
  // if no color is provided, use default color
  // if light mode, use black
  const textColor = color
    ? prefs.isDarkMode
      ? color || defaultColor
      : 'black'
    : defaultColor

  return (
    <div className='circular-progress'>
      <CircularProgressbar
        value={value}
        text={text}
        styles={buildStyles({
          pathColor: progressColor,
          textColor: textColor,
          trailColor: '#e6e6e6',
          textSize: '1.8rem',

          // textStyle: {
          //   fontWeight: 700,
          // },
        })}
      />
    </div>
  )
}
