import { useTranslation } from 'react-i18next'

interface MacrosProps {
  protein: number
  carbs: number
  fats: number
}

export function Macros({ protein, carbs, fats }: MacrosProps) {
  const { t } = useTranslation()

  return (
    <div className='macros'>
      <div className='banner carbs'>
        <span className='swatch' />
        <span className='label'>{t('macros.carbs')}</span>
        <span className='value'>{carbs.toFixed(1)}g</span>
      </div>
      <div className='banner protein'>
        <span className='swatch' />
        <span className='label'>{t('macros.protein')}</span>
        <span className='value'>{protein.toFixed(1)}g</span>
      </div>
      <div className='banner fats'>
        <span className='swatch' />
        <span className='label'>{t('macros.fats')}</span>
        <span className='value'>{fats.toFixed(1)}g</span>
      </div>
    </div>
  )
}
