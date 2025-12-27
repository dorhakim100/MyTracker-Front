import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ListItemIcon } from '@mui/material'
import { RootState } from '../../store/store'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SlideDialog } from '../../components/SlideDialog/SlideDialog'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { EditMeal } from '../../components/EditMeal/EditMeal'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { MacrosDonut } from '../../components/MacrosDonut/MacrosDonut'
import { searchUrls } from '../../assets/config/search.urls'
import { User } from '../../types/user/User'
import { DeleteAction } from '../../components/DeleteAction/DeleteAction'

export function MealsCard() {
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const [isAddMealOpen, setIsAddMealOpen] = useState<boolean>(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  const onAddMeal = () => {
    setIsAddMealOpen(true)
  }

  const saveMeal = async (editMeal: Meal) => {
    try {
      let savedMeal: Meal
      let newUser: User

      if (!editMeal._id) {
        delete (editMeal as Partial<Meal>)._id

        savedMeal = await mealService.save(editMeal)
        newUser = {
          ...(user as User),
          meals: [...(user?.meals || []), savedMeal],
        }
        optimisticUpdateUser(newUser)
      } else if (
        user?.meals.findIndex((meal) => meal._id === editMeal._id) !== -1
      ) {
        newUser = {
          ...(user as User),
          meals: [...(user?.meals || []), editMeal],
        }
        optimisticUpdateUser(newUser)
        savedMeal = await mealService.save(editMeal)
      } else {
        savedMeal = await mealService.save(editMeal)
        newUser = {
          ...(user as User),
          meals: [...(user?.meals || []), editMeal],
        }
        optimisticUpdateUser(newUser)
      }

      onCloseMealDetails()
      await updateUser(newUser)
      showSuccessMsg(messages.success.saveMeal)
    } catch (err) {
      showErrorMsg(messages.error.saveMeal)
      const index = user?.meals.findIndex(
        (meal) => meal._id === editMeal._id
      ) as number
      if (index === -1) return
      user?.meals.splice(index, 1)
      const originalUser = { ...user, meals: [...(user?.meals || [])] } as User
      optimisticUpdateUser(originalUser)
    }
  }

  const onSelectMeal = (meal: Meal) => {
    setIsAddMealOpen(true)
    setSelectedMeal(meal)
  }

  const onCloseMealDetails = () => {
    setSelectedMeal(null)
    setIsAddMealOpen(false)
  }

  const onReorderMeals = async (newMeals: Meal[]) => {
    const newUser = { ...user, meals: newMeals } as User

    optimisticUpdateUser(newUser)

    try {
      await updateUser(newUser)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.saveMeal)
      optimisticUpdateUser(user as User)
    }
  }

  const onDeleteMeal = async (meal: Meal) => {
    const newMeals = user?.meals.filter((m) => m._id !== meal._id)
    const newUser = { ...user, meals: newMeals }

    optimisticUpdateUser(newUser as User)

    try {
      await updateUser(newUser as User)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.deleteMeal)
      optimisticUpdateUser(user as User)
    }
  }

  return (
    <>
      <CustomButton
        text="Add Meal"
        icon={<AddIcon />}
        fullWidth
        onClick={onAddMeal}
      />
      {!user?.meals?.length && (
        <div className="no-results-container">
          <span>No meals added yet</span>
        </div>
      )}
      {user?.meals && user?.meals.length > 0 && (
        <CustomList
          items={user.meals}
          dragOffsetY={-64}
          className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
          renderPrimaryText={(meal) => meal.name}
          renderLeft={(meal) => (
            <div className="left-content macros-image-container">
              <MacrosDonut
                protein={meal.macros?.protein}
                carbs={meal.macros?.carbs}
                fats={meal.macros?.fat}
              />
              <ListItemIcon className="item-image-container">
                <img
                  src={
                    meal.image ||
                    meal.items.find((item) => item.image)?.image ||
                    searchUrls.DEFAULT_IMAGE
                  }
                  alt={meal.name}
                  className="item-image"
                />
              </ListItemIcon>
            </div>
          )}
          renderSecondaryText={(meal) =>
            `${meal.macros.calories.toFixed(0)} kcal`
          }
          onItemClick={onSelectMeal}
          isDragable={true}
          onReorder={onReorderMeals}
          isSwipeable={true}
          renderRightSwipeActions={(meal) => (
            <DeleteAction item={meal} onDeleteItem={onDeleteMeal} />
          )}
        />
      )}
      <SlideDialog
        open={isAddMealOpen}
        onClose={onCloseMealDetails}
        component={<EditMeal saveMeal={saveMeal} selectedMeal={selectedMeal} />}
        title={selectedMeal ? 'Edit Meal' : 'Add Meal'}
        type="full"
      />
    </>
  )
}
