import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Button,
  DialogActions,
  Divider,
  ListItemIcon,
  Typography,
} from '@mui/material'
import { RootState } from '../../store/store'
import {
  deleteAccount,
  handleFavorite,
  logout,
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { setIsLoading, setPrefs } from '../../store/actions/system.actions'
import type { Prefs } from '../../types/system/Prefs'
import { motion } from 'framer-motion'
import { DarkModeSwitch } from '../../components/DarkModeSwitch/DarkModeSwitch'
import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import CheckIcon from '@mui/icons-material/Check'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SkeletonList } from '../../components/SkeletonList/SkeletonList'
import { ProfileCard } from '../../components/ProfileCard/ProfileCard'
// import { searchService } from '../../services/search/search-service'
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton'
import { User } from '../../types/user/User'
import { Item } from '../../types/item/Item'
import { SlideDialog } from '../../components/SlideDialog/SlideDialog'
import { ItemDetails } from '../../components/ItemDetails/ItemDetails'
import { setItem } from '../../store/actions/item.actions'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { EditMeal } from '../../components/EditMeal/EditMeal'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { MacrosDonut } from '../../components/MacrosDonut/MacrosDonut'
import { searchUrls } from '../../assets/config/search.urls'
import { WeightCard } from '../../components/WeightCard/WeightCard'
import { GoalsCard } from '../../components/GoalsCard/GoalsCard'
import { BmrCard } from '../../components/BmrCard/BmrCard'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CalculateIcon from '@mui/icons-material/Calculate'
import SettingsIcon from '@mui/icons-material/Settings'
import ModeStandbyIcon from '@mui/icons-material/ModeStandby'
import { DeleteAction } from '../../components/DeleteAction/DeleteAction'

import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'

const colors = {
  primary: '--var(--primary-color)',
  blue: '--var(--picker-color-blue)',
  yellow: '--var(--picker-color-yellow)',
  red: '--var(--picker-color-red)',
  orange: '--var(--picker-color-orange)',
  green: '--var(--picker-color-green)',
  deepPurple: '--var(--picker-color-deep-purple)',
  purple: '--var(--picker-color-purple)',
  pink: '--var(--picker-color-pink)',
}

export function UserDetails() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  const acrodions = [
    {
      title: 'Meals',
      cmp: <MealsCard />,
      icon: <RestaurantMenuIcon />,
      key: 'meals',
    },
    {
      title: 'Goals',
      cmp: <GoalsCard />,
      icon: <ModeStandbyIcon />,
      key: 'goals',
    },
    {
      title: 'Favorite Items',
      cmp: <FavoriteItemsCard />,
      icon: <FavoriteBorderIcon />,
      key: 'favorite-items',
    },
    {
      title: 'BMR Calculator',
      cmp: <BmrCard />,
      icon: <CalculateIcon />,
      key: 'bmr-calculator',
    },
    {
      title: 'Preferences',
      cmp: <PreferencesCard />,
      icon: <SettingsIcon />,
      key: 'preferences',
    },
  ]

  const setDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
  }

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true)
  }

  const onDeleteAccount = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      await deleteAccount(user)
      setIsDeleteModalOpen(false)
      showSuccessMsg(messages.success.deleteAccount)
      await logout()
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.deleteAccount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className={`page-container user-page ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <ProfileCard />

        <div className='content-container'>
          <WeightCard />

          {acrodions.map((accordion) => (
            <CustomAccordion
              key={`${accordion.key}-accordion`}
              title={accordion.title}
              cmp={accordion.cmp}
              icon={accordion.icon}
            />
          ))}

          <CustomButton
            fullWidth
            onClick={() => logout()}
            className={`${prefs.favoriteColor}`}
            text='Logout'
          />
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />

          <CustomButton
            fullWidth
            onClick={openDeleteModal}
            className={`delete-account-button ${prefs.favoriteColor}`}
            text='Delete Account'
          />
        </div>
      </div>
      <CustomAlertDialog
        open={isDeleteModalOpen}
        onClose={setDeleteModalClose}
        title='Delete Account'
      >
        <DeleteAccountCard
          onDeleteAccount={onDeleteAccount}
          setDeleteModalClose={setDeleteModalClose}
        />
      </CustomAlertDialog>
    </>
  )
}

function ColorMotion({
  color,
  favoriteColor,
}: {
  color: string
  favoriteColor: string
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.8 }}
      animate={color === favoriteColor ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className='motion-container'
    >
      {color === favoriteColor ? <CheckIcon /> : null}
    </motion.div>
  )
}

function FavoriteItemsCard() {
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const favoriteItems = useSelector(
    (storeState: RootState) => storeState.itemModule.favoriteItems
  )
  const [isItemSelected, setIsItemSelected] = useState<boolean>(false)

  const onSelectItem = (item: Item) => {
    setIsItemSelected(true)
    setItem(item)
  }

  const onCloseItemDetails = () => {
    setIsItemSelected(false)
  }

  const onReorder = async (newItems: Item[]) => {
    try {
      const newFavoriteItems = newItems.map((item) => item.searchId)
      const newUser = { ...user, favoriteItems: newFavoriteItems }
      optimisticUpdateUser(newUser as User)
      await updateUser(newUser as User)
    } catch (err) {
      console.error(err)
      optimisticUpdateUser(user as User)
    }
  }

  if (!favoriteItems.length) {
    return <SkeletonList />
  }

  return (
    <>
      <CustomList
        items={favoriteItems || []}
        dragOffsetY={-64}
        renderPrimaryText={(item) => item.name}
        renderLeft={(item) => (
          <div className='left-content macros-image-container'>
            <MacrosDonut
              protein={item.macros?.protein}
              carbs={item.macros?.carbs}
              fats={item.macros?.fat}
            />
            <ListItemIcon className='item-image-container'>
              <img src={item.image} alt={item.name} className='item-image' />
            </ListItemIcon>
          </div>
        )}
        renderRight={(item) =>
          item.searchId ? (
            <FavoriteButton
              isFavorite={user?.favoriteItems?.includes(item.searchId) || false}
            />
          ) : null
        }
        onRightClick={(item) => {
          handleFavorite(item, user as User)
        }}
        onItemClick={onSelectItem}
        isDragable={true}
        onReorder={onReorder}
      />
      <SlideDialog
        open={isItemSelected}
        onClose={onCloseItemDetails}
        component={<ItemDetails />}
        title='Item'
        onSave={() => {}}
        type='full'
      />
    </>
  )
}

function MealsCard() {
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
      console.log('err', err)
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
        text='Add Meal'
        icon={<AddIcon />}
        fullWidth
        onClick={onAddMeal}
      />
      {!user?.meals?.length && (
        <Typography variant='h6'>No meals added yet</Typography>
      )}
      {user?.meals && user?.meals.length > 0 && (
        <CustomList
          items={user.meals}
          dragOffsetY={-64}
          className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
          renderPrimaryText={(meal) => meal.name}
          renderLeft={(meal) => (
            <div className='left-content macros-image-container'>
              <MacrosDonut
                protein={meal.macros?.protein}
                carbs={meal.macros?.carbs}
                fats={meal.macros?.fat}
              />
              <ListItemIcon className='item-image-container'>
                <img
                  src={
                    meal.image ||
                    meal.items.find((item) => item.image)?.image ||
                    searchUrls.DEFAULT_IMAGE
                  }
                  alt={meal.name}
                  className='item-image'
                />
              </ListItemIcon>
            </div>
          )}
          renderSecondaryText={(meal) => `${meal.macros.calories} kcal`}
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
        onSave={() => {}}
        type='full'
      />
    </>
  )
}

function PreferencesCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const [favoriteColor, setFavoriteColor] = useState<string>(
    prefs.favoriteColor || '#1976d2'
  )

  const colorChoices = useMemo<string[]>(() => Object.keys(colors), [])

  function onToggleDarkMode() {
    const newPrefs: Prefs = { ...prefs, isDarkMode: !prefs.isDarkMode }
    setPrefs(newPrefs)
  }

  function onChangeFavoriteColor(color: string) {
    setFavoriteColor(color)
    const newPrefs: Prefs = { ...prefs, favoriteColor: color }
    setPrefs(newPrefs)
  }

  return (
    <>
      <div className='prefs-switch-container'>
        <Typography variant='body1' className='prefs-label'>
          Dark mode
        </Typography>
        <DarkModeSwitch checked={prefs.isDarkMode} onClick={onToggleDarkMode} />
      </div>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <div className='color-prefs-container'>
        <Typography variant='body1' className='prefs-label'>
          Favorite color
        </Typography>
        <div className='color-options'>
          {colorChoices.map((color) => (
            <Button
              key={`${color}-color-button`}
              className={`color-button ${color} ${
                favoriteColor === color ? 'selected' : ''
              }`}
              onClick={() => onChangeFavoriteColor(color)}
              sx={{
                minWidth: '30px',
                minHeight: '30px',
              }}
            >
              <ColorMotion color={color} favoriteColor={favoriteColor} />
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}

function DeleteAccountCard({
  onDeleteAccount,
  setDeleteModalClose,
}: {
  onDeleteAccount: () => void
  setDeleteModalClose: () => void
}) {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  return (
    <>
      <Typography variant='body1'>
        Are you sure you want to delete your account?
      </Typography>

      <Typography variant='body2'>
        This action is irreversible and will delete all your data.
      </Typography>
      <DialogActions>
        <CustomButton
          fullWidth
          onClick={setDeleteModalClose}
          className={`${prefs.favoriteColor}`}
          text='Cancel'
        />
        <CustomButton
          fullWidth
          onClick={onDeleteAccount}
          className={`${prefs.favoriteColor} delete-account-button`}
          text='Delete'
        />
      </DialogActions>
    </>
  )
}
