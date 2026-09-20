import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import {
  AiLogEstimate,
  macrosBand,
} from '../../../types/aiLog/AiLog'
import { Macros } from '../../Macros/Macros'
import { aiEstimateCaptionNs } from './locals'

interface AiEstimateCaptionProps {
  estimate: AiLogEstimate
}

function sumBand(estimate: AiLogEstimate) {
  return estimate.items.reduce(
    (acc, line) => {
      const band = macrosBand(line.per100g, line.gramsMin, line.gramsMax)
      return {
        min: {
          calories: acc.min.calories + band.min.calories,
          protein: acc.min.protein + band.min.protein,
          carbs: acc.min.carbs + band.min.carbs,
          fat: acc.min.fat + band.min.fat,
        },
        max: {
          calories: acc.max.calories + band.max.calories,
          protein: acc.max.protein + band.max.protein,
          carbs: acc.max.carbs + band.max.carbs,
          fat: acc.max.fat + band.max.fat,
        },
      }
    },
    {
      min: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      max: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    }
  )
}

export function AiEstimateCaption({ estimate }: AiEstimateCaptionProps) {
  const { t } = useTranslation(aiEstimateCaptionNs)
  const first = estimate.items[0]
  const gramsMin =
    estimate.mode === 'meal'
      ? estimate.items.reduce((sum, line) => sum + line.gramsMin, 0)
      : first?.gramsMin || 0
  const gramsMax =
    estimate.mode === 'meal'
      ? estimate.items.reduce((sum, line) => sum + line.gramsMax, 0)
      : first?.gramsMax || 0
  const band = sumBand(estimate)

  return (
    <div className='ai-estimate-caption'>
      <Typography
        variant='subtitle2'
        className='caption-title'
      >
        {t('aiCalculated')}
      </Typography>
      <Typography
        variant='body2'
        className='caption-line'
      >
        {t('gramsRange', {
          min: gramsMin,
          max: gramsMax,
        })}
      </Typography>
      <Macros
        className='macros-range'
        protein={band.min.protein}
        carbs={band.min.carbs}
        fats={band.min.fat}
        proteinMax={band.max.protein}
        carbsMax={band.max.carbs}
        fatsMax={band.max.fat}
      />
      {estimate.mode === 'custom' && first && (
        <>
          <Typography
            variant='body2'
            className='caption-line'
          >
            {t('per100g')}
          </Typography>
          <Macros
            className='macros-range'
            protein={first.per100g.protein}
            carbs={first.per100g.carbs}
            fats={first.per100g.fat}
          />
        </>
      )}
    </div>
  )
}
