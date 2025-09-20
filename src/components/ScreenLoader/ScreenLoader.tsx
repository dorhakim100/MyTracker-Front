import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

import { Typography } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'

import loadingAnimation from '../../../public/food-animation.json'

export function ScreenLoader() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    let dots = 0
    const interval = setInterval(() => {
      dots++

      const dotsString = '.'.repeat(dots)
      setDots(dotsString)
      if (dots === 3) {
        dots = 0
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='screen-loader'>
      <div className='loader-container'>
        <Lottie animationData={loadingAnimation} loop={true} />

        <div className='dots-container'>
          <Typography variant='h4'>Loading{dots}</Typography>
        </div>
      </div>

      <LinearProgress />
    </div>
  )
}
