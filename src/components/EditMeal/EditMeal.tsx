import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { RootState } from '../../store/store'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
export function EditMeal() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [editMeal, setEditMeal] = useState<Meal>(mealService.getEmptyMeal())

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

  return (
    <div className='edit-meal-container'>
      <Typography variant='h5'>Edit Meal</Typography>
      <Typography variant='h6'>Meal Name</Typography>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <CustomInput
        value={editMeal.name}
        onChange={(value) => onEditMeal('name', value)}
        placeholder='Meal Name'
      />
      <CustomButton text='Save' onClick={onSaveMeal} fullWidth />
    </div>
  )
}
