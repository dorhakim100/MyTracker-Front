import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { setIsAddModal } from '../../store/actions/system.actions'
import { setSelectedMeal } from '../../store/actions/item.actions'
import { capitalizeFirstLetter } from '../../services/util.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { MealPeriod } from '../../types/mealPeriod/MealPeriod'

interface AddItemButtonProps {
  mealPeriod: MealPeriod
}

export const AddItemButton = ({ mealPeriod }: AddItemButtonProps) => {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <Button
      variant='contained'
      color='primary'
      size='small'
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setIsAddModal(true)
        setSelectedMeal(capitalizeFirstLetter(mealPeriod as MealPeriod))
      }}
      className={`${prefs.favoriteColor}`}
    >
      Add Item
      <AddIcon />
    </Button>
  )
}
