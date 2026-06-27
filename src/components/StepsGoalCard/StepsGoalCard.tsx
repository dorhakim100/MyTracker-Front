import { useMemo, useState } from 'react'
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { updateUser } from '../../store/actions/user.actions'
import {
  DEFAULT_DAILY_STEPS_GOAL,
  MAX_DAILY_STEPS_GOAL,
  MIN_DAILY_STEPS_GOAL,
} from '../../constants/steps-goal.constants'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { syncStepsWidget } from '../../services/widget/steps-widget.service'
import { ClockPicker } from '../Pickers/ClockPicker'
import { PickerSelect } from '../Pickers/PickerSelect'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import type { EditItem } from '../../types/editItem/editItem'
import './styles/StepsGoalCard.scss'

const STEPS_GOAL_STEP = 500
const STEPS_GOAL_QUICK_VALUES = [5_000, 10_000, 15_000]

function buildStepsGoalValues(currentGoal: number) {
  const values: number[] = []
  for (
    let value = MIN_DAILY_STEPS_GOAL;
    value <= MAX_DAILY_STEPS_GOAL;
    value += STEPS_GOAL_STEP
  ) {
    values.push(value)
  }

  if (!values.includes(currentGoal)) {
    values.push(currentGoal)
    values.sort((a, b) => a - b)
  }

  return values
}

export function StepsGoalCard() {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )
  const isNative = useSelector(
    (storeState: RootState) => storeState.systemModule.isNative
  )

  const savedGoal = user?.details?.dailyStepsGoal ?? DEFAULT_DAILY_STEPS_GOAL
  const [pickerOpen, setPickerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const valuesToDisplay = useMemo(
    () => buildStepsGoalValues(savedGoal),
    [savedGoal]
  )

  function openPicker() {
    if (isSaving) {
      return
    }
    setPickerOpen(true)
  }

  function closePicker() {
    setPickerOpen(false)
  }

  async function saveGoal(nextGoal: number) {
    if (!user) {
      return
    }

    const roundedGoal = Math.round(nextGoal)
    if (
      roundedGoal < MIN_DAILY_STEPS_GOAL ||
      roundedGoal > MAX_DAILY_STEPS_GOAL
    ) {
      showErrorMsg(t('health.stepsGoalInvalid'))
      return
    }

    if (roundedGoal === savedGoal) {
      await syncStepsWidget()
      return
    }

    try {
      setIsSaving(true)
      const updatedUser = {
        ...user,
        details: {
          ...user.details,
          dailyStepsGoal: roundedGoal,
        },
      }
      await updateUser(updatedUser)
      await syncStepsWidget()
      showSuccessMsg(t('health.stepsGoalSaved'))
    } catch {
      showErrorMsg(t('health.stepsGoalSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  async function onGoalChange(_key: keyof EditItem, value: number) {
    await saveGoal(value)
  }

  return (
    <div
      className={`steps-goal-card-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <Typography
        variant='caption'
        className='steps-goal-caption'
      >
        {isNative
          ? t('health.stepsGoalCaptionNative')
          : t('health.stepsGoalCaption')}
      </Typography>
      <PickerSelect
        className={`${prefs.favoriteColor} picker-select ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
        openClock={openPicker}
        option={{
          label: t('health.stepsGoalLabel'),
          key: 'dailyStepsGoal',
          type: 'clock',
        }}
        value={savedGoal}
        minWidth={180}
      />
      <SlideDialog
        open={pickerOpen}
        onClose={closePicker}
        title={t('health.stepsGoalLabel')}
        component={
          <ClockPicker
            value={savedGoal}
            onChange={onGoalChange}
            onClose={closePicker}
            isAfterValue={false}
            valuesToDisplay={valuesToDisplay}
            buttonsValues={STEPS_GOAL_QUICK_VALUES}
            minValue={MIN_DAILY_STEPS_GOAL}
            maxValue={MAX_DAILY_STEPS_GOAL}
          />
        }
      />
    </div>
  )
}
