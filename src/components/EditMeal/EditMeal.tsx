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

const stages = ['name', 'items']

export function EditMeal() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [editMeal, setEditMeal] = useState<Meal>(mealService.getEmptyMeal())
  const [stage, setStage] = useState<string>(stages[0])

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
            onClick={() => setStage(stages[0])}
            fullWidth
          />
          <CustomButton
            text='Next'
            onClick={() => setStage(stages[1])}
            fullWidth
          />
        </div>
      </div>
    )
  }

  return (
    <div className='page-container edit-meal-container'>
      <Typography variant='h6'>Meal Name</Typography>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='stage-container'>
        <CustomInput
          value={editMeal.name}
          onChange={(value) => onEditMeal('name', value)}
          placeholder='Meal Name'
        />
      </div>
      {/* <CustomButton text='Save' onClick={onSaveMeal} fullWidth /> */}

      {renderNavigationFooter()}
    </div>
  )
}
