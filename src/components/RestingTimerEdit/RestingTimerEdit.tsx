import { useTranslation } from 'react-i18next'
import { ClockPicker } from '../Pickers/ClockPicker'
import { MINUTE_IN_MS } from '../../assets/config/times'
import { restingTimerEditNs } from './locals'

interface RestingTimerEditProps {
  restingTime: number
  updateRestingTime: (restingTime: number) => void
  onClose: () => void
  forWholeExercise?: boolean
}

const restingTimeValues = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5,
  10,
]

const values = [1, 5, 10]

export function RestingTimerEdit({
  restingTime,
  updateRestingTime,
  onClose,
  forWholeExercise = false,
}: RestingTimerEditProps) {
  const { t } = useTranslation(restingTimerEditNs)

  return (
    <div className='resting-timer-edit-container'>
      <ClockPicker
        value={restingTime / MINUTE_IN_MS}
        onChange={(_, newValue) => {
          updateRestingTime(newValue * MINUTE_IN_MS)
        }}
        onClose={onClose}
        isAfterValue={false}
        valuesToDisplay={restingTimeValues}
        isRounded={false}
        buttonsValues={values}
        header={
          forWholeExercise ? (
            <p className='resting-timer-scope'>{t('allSetsNote')}</p>
          ) : undefined
        }
      />
    </div>
  )
}
