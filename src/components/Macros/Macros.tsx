import { useTranslation } from 'react-i18next'

interface MacrosProps {
  protein: number
  carbs: number
  fats: number
  proteinMax?: number
  carbsMax?: number
  fatsMax?: number
  className?: string
}

function macroValue(min: number, max?: number) {
  const low = min.toFixed(0)
  if (max == null) return `${low}g`
  return `${low}g - ${max.toFixed(0)}g`
}

export function Macros({
  protein,
  carbs,
  fats,
  proteinMax,
  carbsMax,
  fatsMax,
  className = '',
}: MacrosProps) {
  const { t } = useTranslation()

  return (
    <div className={`macros ${className}`.trim()}>
      <div className='banner carbs'>
        <div className='swatch-macro-container'>
          <span className='swatch' />
          <span className='label'>{t('macros.carbs')}</span>
        </div>
        <span className='value'>{macroValue(carbs, carbsMax)}</span>
      </div>
      <div className='banner protein'>
        <div className='swatch-macro-container'>
          <span className='swatch' />
          <span className='label'>{t('macros.protein')}</span>
        </div>
        <span className='value'>{macroValue(protein, proteinMax)}</span>
      </div>
      <div className='banner fats'>
        <div className='swatch-macro-container'>
          <span className='swatch' />
          <span className='label'>{t('macros.fats')}</span>
        </div>
        <span className='value'>{macroValue(fats, fatsMax)}</span>
      </div>
    </div>
  )
}
