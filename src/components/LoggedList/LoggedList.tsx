import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Log } from '../../types/log/Log'
import { Item } from '../../types/item/Item'
import { searchService } from '../../services/search/search-service'
import { searchTypes } from '../../assets/config/search-types'
import { searchUrls } from '../../assets/config/search.urls'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import {
  optimisticUpdateUser,
  removeLogAction,
  // setSelectedDiaryDay,
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
import { mealService } from '../../services/meal/meal.service'
import { Menu } from '../../types/menu/Menu'
import { getTimeFromISO } from '../../services/util.service'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import { itemNameService } from '../../services/item/item-name.service'
import { isBarcodeSearchId } from '../../services/item/item-id.service'

export type LogsSource = 'diary' | 'menu'

interface LoggedListProps {
  mealPeriod: MealPeriod
  isAddButton?: boolean
  logsSource?: LogsSource
  logsToShow?: Log[]
  updateMenu?: (newMenu: Menu) => void
  editMenu?: Menu
  noEdit?: boolean
}

export function LoggedList({
  mealPeriod,
  isAddButton = true,
  logsSource = 'diary',
  logsToShow = [],
  updateMenu,
  editMenu,
  noEdit = false,
}: LoggedListProps) {
  const { t, i18n } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)
  const cachedItems = useSelector((state: RootState) => state.itemModule.items)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const selectedDay = useSelector(
    (state: RootState) => state.userModule.selectedDay
  )
  const menu = useSelector((state: RootState) => state.userModule.menu)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )

  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    let logsToSet: Log[] = []
    if (logsSource === 'menu' && editMenu) {
      logsToSet =
        editMenu.menuLogs?.filter((log) =>
          _filterLogsByMealPeriod(log, mealPeriod)
        ) || []
      setLogs(logsToSet)
      return
    }
    if (logsToShow.length) {
      logsToSet = logsToShow
      setLogs(logsToSet)
      return
    }
    if (logsSource === 'menu') {
      logsToSet =
        menu?.menuLogs?.filter((log) =>
          _filterLogsByMealPeriod(log, mealPeriod)
        ) || []
      setLogs(logsToSet)
      return
    }

    if (selectedDay) {
      logsToSet = selectedDay?.logs?.filter((log) =>
        _filterLogsByMealPeriod(log, mealPeriod)
      )
      setLogs(logsToSet)
      return
    }
    if (mealPeriod)
      logsToSet =
        user?.loggedToday?.logs?.filter((log) =>
          _filterLogsByMealPeriod(log, mealPeriod)
        ) || []
    setLogs(logsToSet)
  }, [
    user,
    mealPeriod,
    selectedDay,
    user?.loggedToday?.logs,
    user?.loggedToday?.logs.length,
    menu?.menuLogs,
    editMenu?.menuLogs,
    logsSource,
    logsToShow,
  ])

  useEffect(() => {
    handleLoadItems()
  }, [selectedDay])

  // useEffect(() => {
  // const isIncomplete = logs.some(
  //   (log) => !log.name && log.source !== searchTypes.custom
  // )
  // if (isIncomplete) {
  //   handleRefreshLogs()
  // }
  // }, [logs])

  function _filterLogsByMealPeriod(log: Log, mealPeriod: string) {
    return log.meal.toLocaleLowerCase() === mealPeriod
  }

  async function handleLoadItems() {
    try {
      // loadItems() // optimistic update from cache, no need to await
      if (!logs || !logs.length) return

      await searchService.searchBulkIds(logs) // actual update from api

      const items = await loadItems() // actual update from api

      return items
    } catch (err) {
      console.error(err)
      // showErrorMsg(t('messages.error.getItem'))
    }
  }

  const showEmptyState =
    logsSource === 'menu'
      ? !logs?.length
      : !user || (!logs?.length && isAddButton)
  if (showEmptyState)
    return (
      <div className='logged-items'>
        <div className='placeholder-container'>
          <div className='placeholder'>{t('meals.noItemsLogged')}</div>
          {isAddButton && <AddItemButton mealPeriod={mealPeriod} />}
        </div>
      </div>
    )

  const getKey = (item: Log) =>
    item._id || item.itemId || item.mealId || item.time

  const renderPrimaryText = (item: Log) => {
    const name =
      itemNameService.getItemDisplayName(item.name, i18n.language) ||
      (item.source === searchTypes.custom ? t('meals.customLog') : null) ||
      itemNameService.getItemDisplayName(
        cachedItems.find((i) => i.searchId === item.itemId)?.name,
        i18n.language
      )

    if (name) {
      return <MarqueeText variant='body1'>{name}</MarqueeText>
    }

    return (
      <CustomSkeleton
        variant='text'
        width='100%'
        height={20}
        isDarkMode={prefs.isDarkMode}
      />
    )
  }

  const renderTimeText = (item: Log) => {
    return (
      <span className='time-text'>{getTimeFromISO(item.createdAt || '')}</span>
    )
  }

  const renderSecondaryText = (item: Log) => {
    if (item.source === searchTypes.custom)
      return `${item.macros?.calories.toFixed(0)} ${t('macros.kcal')}`

    if (item.mealId)
      return `${item.macros?.calories.toFixed(0)} ${t('macros.kcal')}`

    const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
    let caloriesToReturn
    if (cachedItem) caloriesToReturn = +item.macros?.calories
    else caloriesToReturn = +item.macros?.calories
    return caloriesToReturn ? (
      `${caloriesToReturn.toFixed(0)} ${t('macros.kcal')}`
    ) : (
      <CustomSkeleton
        variant='text'
        width='25%'
        height={20}
        isDarkMode={prefs.isDarkMode}
      />
    )
  }

  // async function handleRefreshLogs() {
  //   try {
  //     const items = await handleLoadItems()
  //     setLogs(
  // logs
  // .filter((log) => log.meal.toLocaleLowerCase() === mealPeriod)
  //           .map((log) => {
  //             const item = items?.find(
  //               (item: Item) => item.searchId === log.itemId
  //             )
  //             return {
  //             ...log,
  //             name: item?.name,
  //           }
  //         })
  //     )
  //   } catch (err) {
  //     console.error(err)
  //     showErrorMsg(t('messages.error.updateCalories'))
  //   }
  // }

  const onItemClick = async (mealItem: Log) => {
    setIsEditOpen(true)
    const logToEdit = { ...mealItem }
    let itemToSet

    if (logToEdit.source === searchTypes.custom) {
      setEditMealItem(logToEdit)
      setItem({
        ...logToEdit,
        type: searchTypes.custom,
      } as Item)
      return
    }

    try {
      const cachedItem = cachedItems.find(
        (i) => i.searchId === logToEdit.itemId
      )

      if (cachedItem) {
        logToEdit.name = itemNameService.getItemDisplayName(
          cachedItem.name,
          i18n.language
        )
        logToEdit.image = cachedItem.image
        itemToSet = cachedItem
      } else if (logToEdit.source !== searchTypes.meal && logToEdit.itemId) {
        const searchedItem = await searchService.searchById(
          logToEdit.itemId,
          logToEdit.source ||
            (isBarcodeSearchId(logToEdit.searchId || logToEdit.itemId)
              ? searchTypes.openFoodFacts
              : searchTypes.usda)
        )
        logToEdit.name =
          itemNameService.getItemDisplayName(
            searchedItem?.name,
            i18n.language
          ) || 'Unknown'
        logToEdit.image = searchedItem?.image || searchUrls.DEFAULT_IMAGE
        itemToSet = searchedItem
      } else if (logToEdit.mealId) {
        const meal = await mealService.getById(logToEdit.mealId)

        logToEdit.name = logToEdit.name || meal.name
        logToEdit.image =
          meal.image ||
          meal.items.find((item) => item.image)?.image ||
          searchUrls.DEFAULT_IMAGE
        itemToSet = meal
      }
      logToEdit.searchId = logToEdit.itemId

      if (!itemToSet.image) {
        const image = await imageService.getSingleImage(
          itemNameService.getItemDisplayName(itemToSet.name, i18n.language)
        )
        itemToSet.image = image
        logToEdit.image = image
      }

      if (!itemToSet) {
        showErrorMsg(t('messages.error.editMeal'))
        return
      }

      setEditMealItem({ ...logToEdit })
      setItem(itemToSet as Item)
    } catch {
      showErrorMsg(t('messages.error.editMeal'))
    }
  }

  const onDeleteLog = async (log: Log) => {
    if (isLoading) return
    try {
      if (logsSource === 'menu') {
        const newLogs =
          editMenu?.menuLogs.filter((l) => l._id !== log._id) || []
        const newMenu = {
          ...(editMenu as Menu),
          menuLogs: newLogs,
        }
        if (updateMenu) {
          updateMenu(newMenu)
        }

        showSuccessMsg(t('messages.success.updateCalories'))
        return
      }

      const newToday = removeLogAction(log, selectedDay as LoggedToday)
      const newLogs = newToday.logs.filter((l) => l._id !== log._id)
      const newLoggedToday = {
        ...newToday,
        logs: newLogs,
      }

      if (user && newToday._id === user.loggedToday._id) {
        const newUser = {
          ...user,
          loggedToday: { ...newLoggedToday },
        }
        optimisticUpdateUser(newUser)
      }
      // setSelectedDiaryDay({ ...newLoggedToday })
      setLogs(newLogs)
      await logService.remove(log._id as string)

      dayService.save(newLoggedToday as LoggedToday)
      showSuccessMsg(t('messages.success.updateCalories'))
    } catch {
      showErrorMsg(t('messages.error.updateCalories'))
      if (user) optimisticUpdateUser(user)
    }
  }

  const closeEdit = () => {
    setEditMealItem(null)
    setIsEditOpen(false)
  }

  const getIsSwipeable = () => {
    if (noEdit) return false
    if (isLoading) return false

    return true
  }

  //   const renderLeftSwipeActions = () => (
  //     <SwipeAction onClick={() => console.info('swipe action triggered')}>
  //       Action name
  //     </SwipeAction>
  //   )

  return (
    <>
      <CustomList
        items={logs || []}
        getKey={getKey}
        renderPrimaryText={renderPrimaryText}
        renderSecondaryText={renderSecondaryText}
        // renderRight={renderRight}
        onItemClick={onItemClick}
        isSwipeable={getIsSwipeable()}
        // renderLeftSwipeActions={renderLeftSwipeActions}
        renderRightSwipeActions={(item) => (
          <DeleteAction
            item={item}
            onDeleteItem={onDeleteLog}
          />
        )}
        renderRight={renderTimeText}
        itemClassName={`meal-item-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      />
      <SlideDialog
        open={isEditOpen}
        onClose={closeEdit}
        title={t('meals.editMeal')}
        component={
          <ItemDetails
            updateMenu={updateMenu}
            editMenu={editMenu}
            noEdit={noEdit}
            shouldDefaultItemMacros={true}
          />
        }
        onSave={closeEdit}
        type='full'
      />
    </>
  )
}
