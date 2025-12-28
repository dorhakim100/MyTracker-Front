import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Log } from '../../types/log/Log'
import { Item } from '../../types/item/Item'
import { searchService } from '../../services/search/search-service'
import { searchTypes } from '../../assets/config/search-types'
import { searchUrls } from '../../assets/config/search.urls'
import { messages } from '../../assets/config/messages'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import {
  optimisticUpdateUser,
  removeLogAction,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import {
  setItem,
  setEditMealItem,
  loadItems,
} from '../../store/actions/item.actions'

import { logService } from '../../services/log/log.service'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { dayService } from '../../services/day/day.service'
import { MealPeriod } from '../../types/mealPeriod/MealPeriod'
import { CustomSkeleton } from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { AddItemButton } from '../AddItemButton/AddItemButton'
import { DeleteAction } from '../DeleteAction/DeleteAction'
import { imageService } from '../../services/image/image.service'

export function LoggedList({ mealPeriod }: { mealPeriod: MealPeriod }) {
  const user = useSelector((state: RootState) => state.userModule.user)
  const cachedItems = useSelector((state: RootState) => state.itemModule.items)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const selectedDay = useSelector(
    (state: RootState) => state.userModule.selectedDay
  )

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const logs = useMemo(() => {
    if (selectedDay)
      return selectedDay?.logs?.filter((log) =>
        _filterLogsByMealPeriod(log, mealPeriod)
      )
    if (mealPeriod)
      return user?.loggedToday?.logs?.filter((log) =>
        _filterLogsByMealPeriod(log, mealPeriod)
      )
    return user?.loggedToday?.logs
  }, [user, mealPeriod, selectedDay])

  useEffect(() => {
    handleLoadItems()
  }, [selectedDay])

  function _filterLogsByMealPeriod(log: Log, mealPeriod: string) {
    return log.meal.toLocaleLowerCase() === mealPeriod
  }

  async function handleLoadItems() {
    try {
      // loadItems() // optimistic update from cache, no need to await
      if (!logs || !logs.length) return

      await searchService.searchBulkIds(logs) // actual update from api
      await loadItems() // actual update from api
    } catch (err) {
      console.error(err)
      // showErrorMsg(messages.error.getItem)
    }
  }

  if (!user || !logs?.length)
    return (
      <div className="logged-items">
        <div className="placeholder-container">
          <div className="placeholder">No items logged yet</div>
          <AddItemButton mealPeriod={mealPeriod} />
        </div>
      </div>
    )

  const getKey = (item: Log) => item.itemId + item.time

  const renderPrimaryText = (item: Log) => {
    if (item.name) return item.name
    if (item.source === searchTypes.custom) return 'Custom Log'
    const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
    return (
      cachedItem?.name || (
        <CustomSkeleton
          variant="text"
          width="100%"
          height={20}
          isDarkMode={prefs.isDarkMode}
        />
      )
    )
  }

  const renderSecondaryText = (item: Log) => {
    if (item.source === searchTypes.custom)
      return `${item.macros?.calories.toFixed(0)} kcal`
    const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
    let caloriesToReturn
    if (cachedItem) caloriesToReturn = +item.macros?.calories
    return caloriesToReturn ? (
      `${caloriesToReturn.toFixed(0)} kcal`
    ) : (
      <CustomSkeleton
        variant="text"
        width="25%"
        height={20}
        isDarkMode={prefs.isDarkMode}
      />
    )
  }

  const onItemClick = async (mealItem: Log) => {
    setIsEditOpen(true)
    let itemToSet

    if (mealItem.source === searchTypes.custom) {
      setEditMealItem(mealItem)
      return
    }

    try {
      const cachedItem = cachedItems.find((i) => i.searchId === mealItem.itemId)

      if (cachedItem) {
        mealItem.name = cachedItem.name
        mealItem.image = cachedItem.image
        itemToSet = cachedItem
      } else {
        const searchedItem = await searchService.searchById(
          mealItem.itemId,
          mealItem.source ||
            (mealItem.searchId && mealItem.searchId.length >= 10)
            ? searchTypes.openFoodFacts
            : searchTypes.usda
        )
        mealItem.name = searchedItem?.name || 'Unknown'
        mealItem.image = searchedItem?.image || searchUrls.DEFAULT_IMAGE
        itemToSet = searchedItem
      }
      mealItem.searchId = mealItem.itemId

      if (!itemToSet.image) {
        const image = await imageService.getSingleImage(itemToSet.name)
        itemToSet.image = image
        mealItem.image = image
      }

      if (!itemToSet) {
        showErrorMsg(messages.error.editMeal)
        return
      }

      setEditMealItem({ ...mealItem })
      setItem(itemToSet as Item)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.editMeal)
    }
  }

  const onDeleteLog = async (log: Log) => {
    try {
      const newToday = removeLogAction(log, selectedDay as LoggedToday)

      if (newToday._id === user.loggedToday._id) {
        const newUser = {
          ...user,
          loggedToday: newToday,
        }
        optimisticUpdateUser(newUser)
        // await updateUser({newUser})
      }
      setSelectedDiaryDay(newToday)
      await logService.remove(log._id as string)

      dayService.save(newToday as LoggedToday)
      showSuccessMsg(messages.success.updateCalories)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.updateCalories)
      optimisticUpdateUser(user)
    }
  }

  const closeEdit = () => {
    setEditMealItem(null)
    setIsEditOpen(false)
  }

  //   const renderLeftSwipeActions = () => (
  //     <SwipeAction onClick={() => console.info('swipe action triggered')}>
  //       Action name
  //     </SwipeAction>
  //   )

  return (
    <>
      <CustomList
        items={logs}
        getKey={getKey}
        renderPrimaryText={renderPrimaryText}
        renderSecondaryText={renderSecondaryText}
        // renderRight={renderRight}
        onItemClick={onItemClick}
        isSwipeable={true}
        // renderLeftSwipeActions={renderLeftSwipeActions}
        renderRightSwipeActions={(item) => (
          <DeleteAction item={item} onDeleteItem={onDeleteLog} />
        )}
        itemClassName={`meal-item-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      />
      <SlideDialog
        open={isEditOpen}
        onClose={closeEdit}
        title="Edit Meal"
        component={<ItemDetails />}
        onSave={closeEdit}
        type="full"
      />
    </>
  )
}
