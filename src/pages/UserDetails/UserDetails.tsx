import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Button, Card, Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import {
  handleFavorite,
  logout,
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { setPrefs } from '../../store/actions/system.actions'
import type { Prefs } from '../../types/system/Prefs'
import { motion } from 'framer-motion'
import { DarkModeSwitch } from '../../components/DarkModeSwitch/DarkModeSwitch'
import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import CheckIcon from '@mui/icons-material/Check'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SkeletonList } from '../../components/SkeletonList/SkeletonList'
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

  return (
    <div
      className={`page-container user-page ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <Card
        variant='outlined'
        className={`card user-details ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <div className='profile-container'>
          <img
            className='profile-avatar'
            src={user?.imgUrl || '/logo-square.png'}
            alt='Profile'
          />
          <div className='profile-info'>
            <Typography variant='h5'>
              {user?.fullname || 'User Profile'}
            </Typography>
          </div>
        </div>
      </Card>
      <div className='content-container'>
        <Card
          variant='outlined'
          className={`card user-details ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        ></Card>

        <CustomAccordion title='Meals' cmp={<MealsCard />} />
        <CustomAccordion title='Favorite Items' cmp={<FavoriteItemsCard />} />
        <CustomAccordion title='Preferences' cmp={<PreferencesCard />} />

        <CustomButton
          fullWidth
          onClick={() => logout()}
          className={`${prefs.favoriteColor}`}
          text='Logout'
        />
      </div>
    </div>
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

  // const [favoriteItems, setFavoriteItems] = useState<Item[]>([])
  const favoriteItems = useSelector(
    (storeState: RootState) => storeState.itemModule.favoriteItems
  )
  const [isItemSelected, setIsItemSelected] = useState<boolean>(false)

  // useEffect(() => {
  // const handleFavoritesSearch = async () => {
  //   const res = await searchService.search({
  //     favoriteItems: user?.favoriteItems || [],
  //   })

  //   setFavoriteItems(res)
  // }

  // handleFavoritesSearch()
  // }, [user])

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
        renderPrimaryText={(item) => item.name}
        renderLeft={(item) => (
          <img src={item.image} alt={item.name} className='item-image' />
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

  return (
    <>
      <CustomButton
        text='Add Meal'
        icon={<AddIcon />}
        fullWidth
        onClick={onAddMeal}
      />
      {!user?.meals.length && (
        <Typography variant='h6'>No meals added yet</Typography>
      )}
      {user?.meals && user?.meals.length > 0 && (
        <CustomList
          items={user.meals}
          renderPrimaryText={(meal) => meal.name}
          renderLeft={(meal) => (
            <MacrosDonut
              protein={meal.macros.protein}
              carbs={meal.macros.carbs}
              fats={meal.macros.fat}
            />
          )}
          renderSecondaryText={(meal) => `${meal.macros.calories} kcal`}
          onItemClick={onSelectMeal}
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
