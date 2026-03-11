import { useEffect, useMemo, useState } from 'react'
import Lottie from 'lottie-react'
import { useTranslation } from 'react-i18next'
import { useTypewriter, Cursor } from 'react-simple-typewriter'

import { Typography } from '@mui/material'
// import LinearProgress from '@mui/material/LinearProgress'

import loadingAnimation from '../../../public/food-animation.json'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { loadingPhraseKeys } from '../../assets/config/loading-phrases'
import { shuffle } from '../../services/util.service'


export function ScreenLoader() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const words = useMemo(
    () => shuffle(loadingPhraseKeys.map((key) => t(key))),
    [t]
  )
  const [dots, setDots] = useState('')
  const [typedText] = useTypewriter({
    words,
    loop: 0, // infinite
    typeSpeed: 70,
    deleteSpeed: 50,
    delaySpeed: 1500,
  })

  useEffect(() => {
    let dots = 0
    const interval = setInterval(() => {
      const dotsString = '.'.repeat(dots)
      setDots(dotsString)
      dots++
      if (dots === 4) {
        dots = 0
      }
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='screen-loader'>
      <div className='loader-container'>
        <Lottie animationData={loadingAnimation} loop={true} />
        <div className={`dots-container ${prefs.lang === 'he' ? 'he' : ''}`}>
          <Typography variant='h4'>{t('common.loading')}{dots}</Typography>
        </div>
        <div
          className='typewriter-container'
        >
          <Typography variant='h4'>
            <span>{typedText}</span>
            <Cursor cursorStyle='_'  />
          </Typography>
        </div>
      </div>
    </div>
  )
}
