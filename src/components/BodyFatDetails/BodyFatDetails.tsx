import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import { useTypewriter, Cursor } from 'react-simple-typewriter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import type { BodyFatResult } from '../../types/bodyFat/BodyFat'

export interface BodyFatDetailsProps {
  imageUrl: string
  weightKg: number
  result: BodyFatResult
}

export function BodyFatDetails({
  imageUrl,
  weightKg,
  result,
}: BodyFatDetailsProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const animatedText = useMemo(() => {
    if (result.kind === 'success') return result.note
    return result.message
  }, [result])

  const [typedText] = useTypewriter({
    words: [animatedText],
    loop: 1,
    typeSpeed: 35,
    deleteSpeed: 0,
    delaySpeed: 300,
  })

  const isRtl = prefs.lang === 'he'

  const minBodyFat = result.kind === 'success' ? result.bodyFatMin : 0
  const maxBodyFat = result.kind === 'success' ? result.bodyFatMax : 0


    return (
      <div
        className={`body-fat-details ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          isRtl ? 'rtl' : ''
        }`}
      >
        <div className='details-photo box-shadow white-outline'>
          <img src={imageUrl} alt={t('bodyFat.photoAlt')} />
        </div>

        <div className='details-meta'>
          <div className='meta-item result-item'>
            <Typography variant='h4' className='meta-value result-range'>
              {t('bodyFat.resultRange', {
                min: minBodyFat,
                max: maxBodyFat,
              })}
            </Typography>
              <Typography variant='caption' className='meta-label'>
                {t('bodyFat.detailsBodyFat')}
              </Typography>
          </div>
          <div className='meta-item'>
            <Typography variant='h4' className='meta-value'>
              {weightKg}
              <span className='meta-unit'>{t('weight.kg')}</span>
            </Typography>
            <Typography variant='caption' className='meta-label'>
              {t('bodyFat.detailsWeight')}
            </Typography>
          </div>

        </div>

        <div className='details-note typewriter-container'>
          <Typography variant='body1' component='div' className='note-text'>
            <span>{typedText}</span>
            <Cursor cursorStyle='|' />
          </Typography>
        </div>
      </div>
    )

}
