import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { setIsAddModal } from '../../store/actions/system.actions'
import { setSelectedMeal } from '../../store/actions/item.actions'
import { capitalizeFirstLetter } from '../../services/util.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { MealPeriod } from '../../types/mealPeriod/MealPeriod'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

interface AddItemButtonProps {
  mealPeriod: MealPeriod
}

export const AddItemButton = ({ mealPeriod }: AddItemButtonProps) => {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  return (
    <CustomButton
      text={t('meals.addItem')}
      icon={<AddIcon />}
      size="small"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setIsAddModal(true)
        setSelectedMeal(capitalizeFirstLetter(mealPeriod as MealPeriod))
      }}
      className={`${prefs.favoriteColor}`}
      disabled={timer}
    />
  )
}
