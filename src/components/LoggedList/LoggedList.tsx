import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Log } from '../../types/log/Log'
import { Item } from '../../types/item/Item'
import { searchService } from '../../services/search/search-service'
import { searchTypes } from '../../assets/config/search-types'
import { searchUrls } from '../../assets/config/search.urls'
import { messages } from '../../assets/config/messages'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { removeLog } from '../../store/actions/user.actions'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { setItem, setEditMealItem } from '../../store/actions/item.actions'
import { SwipeAction } from 'react-swipeable-list'
import DeleteIcon from '@mui/icons-material/Delete'
import { Typography } from '@mui/material'

export function LoggedList() {
  const user = useSelector((state: RootState) => state.userModule.user)
  const cachedItems = useSelector((state: RootState) => state.itemModule.items)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  if (!user || !user.loggedToday.logs)
    return (
      <div className='logged-items'>
        <div className='placeholder'>No items logged yet</div>
      </div>
    )

  const logs = user.loggedToday.logs

  const getKey = (item: Log) => item.itemId + item.time

  const renderPrimaryText = (item: Log) => {
    const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
    return cachedItem?.name
  }

  const renderSecondaryText = (item: Log) => {
    // const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
    return `${item.macros?.calories} kcal`
  }

  const onItemClick = async (mealItem: Log) => {
    setIsEditOpen(true)
    let itemToSet
    try {
      const cachedItem = cachedItems.find((i) => i.searchId === mealItem.itemId)
      if (cachedItem) {
        mealItem.name = cachedItem.name
        mealItem.image = cachedItem.image
        itemToSet = cachedItem
      } else {
        const searchedItem = await searchService.searchById(
          mealItem.itemId,
          searchTypes.openFoodFacts
        )
        mealItem.name = searchedItem?.name || 'Unknown'
        mealItem.image = searchedItem?.image || searchUrls.DEFAULT_IMAGE
        itemToSet = searchedItem
      }
      mealItem.searchId = mealItem.itemId

      if (!itemToSet) {
        showErrorMsg(messages.error.editMeal)
        return
      }

      setItem(itemToSet as Item)

      setEditMealItem(mealItem)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.editMeal)
    }
  }

  const onRightClick = async (log: Log) => {
    try {
      await removeLog(log, user)
      showSuccessMsg(messages.success.editMeal)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.editMeal)
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

  const renderRightSwipeActions = (log: Log) => (
    <SwipeAction
      destructive={true} // will remove the item from the list
      onClick={() => {
        onRightClick(log)
      }}
    >
      <div className='swipeable-right-action delete'>
        <DeleteIcon className='delete-icon-button' />
        <Typography variant='body2'>Delete</Typography>
      </div>
    </SwipeAction>
  )

  return (
    <>
      <CustomList
        items={logs}
        getKey={getKey}
        renderPrimaryText={renderPrimaryText}
        renderSecondaryText={renderSecondaryText}
        // renderRight={renderRight}
        onItemClick={onItemClick}
        // onRightClick={onRightClick}
        isSwipeable={true}
        // renderLeftSwipeActions={renderLeftSwipeActions}
        renderRightSwipeActions={renderRightSwipeActions}
        itemClassName={`meal-item-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      />
      <SlideDialog
        open={isEditOpen}
        onClose={closeEdit}
        title='Edit Meal'
        component={<ItemDetails />}
        onSave={closeEdit}
        type='full'
      />
    </>
  )
}
