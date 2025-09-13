import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { RootState } from '../../store/store'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { capitalizeFirstLetter } from '../../services/util.service'
import { AnimatePresence, motion } from 'framer-motion'

const stages = ['name', 'items']

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 360 : -360, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -360 : 360, opacity: 0 }),
}

export function EditMeal() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [editMeal, setEditMeal] = useState<Meal>(mealService.getEmptyMeal())
  const [stage, setStage] = useState<string>(stages[0])
  const [direction, setDirection] = useState(1)

  const onEditMeal = (key: keyof Meal, value: string | number) => {
    const newEditMeal = { ...editMeal }
    switch (key) {
      case 'name':
        newEditMeal.name = value as string
        break
      // case 'items':
      // setEditMeal({ ...editMeal, items: value as string[] })
      // break

      default:
        break
    }

    setEditMeal(newEditMeal)
  }

  const onSaveMeal = () => {
    console.log('editMeal', editMeal)
    // mealService.save(editMeal)
  }

  useEffect(() => {
    // console.log('editMeal', editMeal)
  }, [editMeal])

  const onChangeStage = (diff: number) => {
    if (_getDisabledNavButton(diff > 0 ? 'next' : 'previous')) return
    const next = stages.indexOf(stage) + diff
    setDirection(diff > 0 ? 1 : -1)
    setStage(stages[next])
  }

  const renderStageContent = () => {
    if (stage === 'name')
      return (
        <div className='stage-container'>
          <CustomInput
            value={editMeal.name}
            onChange={(value) => onEditMeal('name', value)}
            placeholder='Meal Name'
          />
        </div>
      )
    if (stage === 'items') return <div className='stage-container'></div>
  }

  const renderNavigationFooter = () => {
    return (
      <div className='edit-meal-footer'>
        <Stepper
          activeStep={stages.indexOf(stage)}
          alternativeLabel
          className={`stepper ${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor
          }`}
        >
          {stages.map((stage) => (
            <Step key={stage}>
              <StepLabel>{capitalizeFirstLetter(stage)}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div className='buttons-container'>
          <CustomButton
            text='Previous'
            onClick={() => onChangeStage(-1)}
            fullWidth
            disabled={_getDisabledNavButton('previous')}
          />
          <CustomButton
            text='Next'
            onClick={() => onChangeStage(1)}
            fullWidth
            disabled={_getDisabledNavButton('next')}
          />
        </div>
      </div>
    )
  }

  function _getDisabledNavButton(type: 'previous' | 'next') {
    if (type === 'previous' && stage === stages[0]) return true

    if (type === 'next') {
      if (stage === stages[stages.length - 1]) return true

      console.log('stage', stage)
      switch (stage) {
        case 'name':
          if (!editMeal.name) return true
          break
        case 'items':
          if (!editMeal.items.length) return true
          break

        default:
          break
      }
    }
    return false
  }

  return (
    <div className='page-container edit-meal-container'>
      <Typography variant='h6'>
        {stage === 'name' ? 'Enter Meal Name' : editMeal.name}
      </Typography>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='stage-container'>
        <AnimatePresence initial={false} custom={direction} mode='wait'>
          <motion.div
            key={stage}
            custom={direction}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ type: 'tween', duration: 0.25 }}
          >
            {renderStageContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* <CustomButton text='Save' onClick={onSaveMeal} fullWidth /> */}

      {renderNavigationFooter()}
    </div>
  )
}
