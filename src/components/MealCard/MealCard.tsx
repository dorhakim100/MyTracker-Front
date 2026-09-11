import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Divider, Typography } from '@mui/material'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { MoreHoriz } from '@mui/icons-material'
import { RootState } from '../../store/store'
import { LoggedList, LogsSource } from '../LoggedList/LoggedList'
import { AddItemButton } from '../AddItemButton/AddItemButton'
import { MealPeriod } from '../../types/mealPeriod/MealPeriod'
import { Log } from '../../types/log/Log'
import { Menu } from '../../types/menu/Menu'
import { AnimatedWrapper } from '../AnimatedWrapper/AnimatedWrapper'
import { CustomOptionsMenu } from '../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { SaveCancel } from '../SaveCancel/SaveCancel'
import { logService } from '../../services/log/log.service'
import {
  optimisticUpdateUser,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { capacitorService } from '../../services/capacitor.service'
import { mealCardNs } from './locals'
import {
  CustomIcon,
  CustomIconName,
} from '../../CustomMui/CustomIcon/CustomIcon'

export interface MealCardMeal {
  label: string
  period: string
  rangeLabel: string
  icon: React.ReactNode
}

interface MealCardProps {
  meal: MealCardMeal
  caloriesToSet: number
  showEmptyCardAddButton: boolean
  isAddButton?: boolean
  logsSource?: LogsSource
  logsToShow?: Log[]
  updateMenu?: (newMenu: Menu) => void
  editMenu?: Menu
  noEdit?: boolean
  className?: string
}

export function MealCard({
  meal,
  caloriesToSet,
  showEmptyCardAddButton,
  isAddButton = true,
  logsSource = 'diary',
  logsToShow = [],
  updateMenu,
  editMenu,
  noEdit = false,
  className = '',
}: MealCardProps) {
  const { t } = useTranslation()
  const { t: tMeal } = useTranslation(mealCardNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const selectedDay = useSelector(
    (state: RootState) => state.userModule.selectedDay
  )
  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )
  const [isClearOpen, setIsClearOpen] = useState(false)

  const isLogsMode = logsSource === 'diary' && !noEdit

  const menuOptions = useMemo(
    () => [
      {
        title: tMeal('clearMeal'),
        icon: <DeleteSweepIcon />,
        onClick: () => {
          setIsClearOpen(true)
          capacitorService.vibrate('Light')
        },
      },
    ],
    [tMeal]
  )

  const onClearMeal = async () => {
    setIsClearOpen(false)
    if (!user || !selectedDay || isLoading) return

    const mealKey = meal.period.toLowerCase()
    const remainingLogs = (selectedDay.logs || []).filter(
      (log) => log.meal.toLowerCase() !== mealKey
    )
    const newCalories = remainingLogs.reduce(
      (acc, log) => acc + log.macros.calories,
      0
    )
    const newDay = {
      ...selectedDay,
      logs: remainingLogs,
      calories: newCalories,
    }
    const previousDay = selectedDay
    const previousUser = user

    setIsClearOpen(false)
    setSelectedDiaryDay(newDay)
    if (user.loggedToday?._id === selectedDay._id) {
      optimisticUpdateUser({
        ...user,
        loggedToday: newDay,
      })
    }

    try {
      await logService.clearMeal({
        userId: user._id,
        meal: meal.period,
        date: selectedDay.date,
      })
      showSuccessMsg(tMeal('mealCleared'))
    } catch {
      setSelectedDiaryDay(previousDay)
      optimisticUpdateUser(previousUser)
      showErrorMsg(tMeal('mealClearFailed'))
    }
  }

  return (
    <>
      <AnimatedWrapper>
        <Box
          className={`meal-card ${className} ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${prefs.favoriteColor || ''}`}
        >
          <div className='header'>
            <div className='label-container'>
              <CustomIcon
                name={meal.period as CustomIconName}
                size='m'
                variant='subtle'
                className='meal-icon'
              />
              <Typography
                variant='h6'
                className='bold-header meal-name'
              >
                {meal.label}
              </Typography>
              <Typography
                variant='body2'
                className='period'
              >
                {meal.rangeLabel}
              </Typography>
            </div>
            <div className='header-actions'>
              {isLogsMode && (
                <CustomOptionsMenu
                  className='meal-options'
                  options={menuOptions}
                  triggerElement={
                    <CustomButton
                      isIcon={true}
                      icon={<MoreHoriz />}
                      variant='flat'
                      size='small'
                    />
                  }
                />
              )}
            </div>
          </div>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
          <LoggedList
            mealPeriod={meal.period as MealPeriod}
            isAddButton={isAddButton}
            logsSource={logsSource}
            logsToShow={logsToShow}
            updateMenu={updateMenu}
            editMenu={editMenu}
            noEdit={noEdit}
          />
          <div className='meal-footer'>
            <Typography
              variant='body2'
              className='total-calories'
            >
              {`${t('macros.total')}: ${caloriesToSet.toFixed(0)} ${t(
                'macros.kcal'
              )}`}
            </Typography>
            {showEmptyCardAddButton && (
              <AddItemButton mealPeriod={meal.period as MealPeriod} />
            )}
          </div>
        </Box>
      </AnimatedWrapper>
      {isLogsMode && (
        <CustomAlertDialog
          open={isClearOpen}
          onClose={() => setIsClearOpen(false)}
          title={tMeal('clearMeal')}
          className='clear-meal-dialog'
        >
          <div className='modal-clear-meal-container'>
            <Typography variant='body1'>{tMeal('clearMealConfirm')}</Typography>
            <SaveCancel
              onCancel={() => setIsClearOpen(false)}
              onSave={onClearMeal}
              cancelText={t('common.cancel')}
              saveText={t('common.clear')}
              saveButtonClassName='alternative'
            />
          </div>
        </CustomAlertDialog>
      )}
    </>
  )
}
