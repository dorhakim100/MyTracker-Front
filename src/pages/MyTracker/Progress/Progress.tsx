import { Card, Divider, ListItemIcon, Typography } from '@mui/material'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { WeightChart } from '../../../components/WeightChart/WeightChart'

import { debounce } from '../../../services/util.service'

import { getDateFromISO } from '../../../services/util.service'
import { dayService } from '../../../services/day/day.service'
import { RootState } from '../../../store/store'
import { useSelector } from 'react-redux'
import { searchService } from '../../../services/search/search-service'
import { loadItems, setEditMealItem } from '../../../store/actions/item.actions'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { LoggedToday } from '../../../types/loggedToday/LoggedToday'
import { messages } from '../../../assets/config/messages'
import { showErrorMsg } from '../../../services/event-bus.service'
import { israelLocaleStringObject } from '../../../assets/config/times'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ItemDetails } from '../../../components/ItemDetails/ItemDetails'
import { Log } from '../../../types/log/Log'
import CustomSkeleton from '../../../CustomMui/CustomSkeleton/CustomSkeleton'
import { SkeletonList } from '../../../components/SkeletonList/SkeletonList'
import { MacrosDonut } from '../../../components/MacrosDonut/MacrosDonut'
import { searchTypes } from '../../../assets/config/search-types'
import { searchUrls } from '../../../assets/config/search.urls'
import { imageService } from '../../../services/image/image.service'
import { Item } from '../../../types/item/Item'

const ONE_DAY = 24 * 60 * 60 * 1000

export function Progress() {
  const user = useSelector((state: RootState) => state.userModule.user)

  const [isEditOpen, setIsEditOpen] = useState(false)

  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().getTime() - ONE_DAY)
  )
  const [loggedToday, setLoggedToday] = useState<LoggedToday | null>(null)

  const computedSelectedDate = useMemo(() => {
    const date = new Date(selectedDate.getTime())
    return getDateFromISO(date.toISOString())
  }, [selectedDate])

  const getLoggedToday = useCallback(async () => {
    try {
      const loggedToday = await dayService.query({
        date: computedSelectedDate,
        userId: user?._id,
      })

      setLoggedToday(loggedToday)
      return loggedToday
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.getDiary)
    }
  }, [computedSelectedDate, user?._id])

  const handleLoadItems = useCallback(async () => {
    try {
      // loadItems() // optimistic update from cache, no need to await
      const res = await getLoggedToday()
      if (!res || !res.logs.length) return

      await searchService.searchBulkIds(res.logs) // actual update from api
      await loadItems() // actual update from api
    } catch (err) {
      console.error(err)
      // showErrorMsg(messages.error.getItem)
    }
  }, [getLoggedToday])

  const debouncedLoadItems = useMemo(
    () => debounce(handleLoadItems, 300),
    [handleLoadItems]
  )

  useEffect(() => {
    debouncedLoadItems()
    return () => debouncedLoadItems.clear?.()
  }, [debouncedLoadItems])

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditMealItem(null)
  }

  const onItemClick = (item: Log) => {
    setIsEditOpen(true)
    setEditMealItem(item)
  }

  return (
    <>
      <div
        className='page-container progress-container'
        style={{ overflowY: 'hidden' }}
      >
        <WeightChart
          sentUser={user || undefined}
          setSelectedDate={setSelectedDate}
        />

        <LogsList
          loggedToday={loggedToday}
          onItemClick={onItemClick}
        />
      </div>
      <SlideDialog
        open={isEditOpen}
        onClose={closeEdit}
        component={<ItemDetails noEdit={true} />}
        title='Edit Meal'
        onSave={closeEdit}
        type='half'
      />
    </>
  )
}

function LogsList({
  loggedToday,
  onItemClick,
}: {
  loggedToday: LoggedToday | null
  onItemClick: (item: Log) => void
}) {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const cachedItems = useSelector((state: RootState) => state.itemModule.items)

  const hebrewDate = useMemo(() => {
    if (!loggedToday) return ''
    const date = new Date(loggedToday.date)
    return date.toLocaleDateString('he', israelLocaleStringObject)
  }, [loggedToday])

  const handleItemClick = (item: Log) => {
    const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
    if (cachedItem) {
      item.image = cachedItem.image
      item.name = cachedItem.name
    }
    setEditMealItem(item)
    onItemClick(item)
  }

  const renderList = () => {
    if (!loggedToday) return <SkeletonList SKELETON_NUMBER={8} />
    return (
      <CustomList
        items={loggedToday.logs}
        getKey={(item) => item._id + ''}
        renderPrimaryText={(i) => {
          if (i.name) return i.name
          if (i.source === searchTypes.custom) return 'Custom Log'
          return (
            cachedItems.find((item) => item.searchId === i.itemId)?.name || (
              <CustomSkeleton
                variant='text'
                width='100%'
                height={20}
                isDarkMode={prefs.isDarkMode}
              />
            )
          )
        }}
        renderSecondaryText={(i) => {
          if (i.source === searchTypes.custom)
            return `${i.macros?.calories} kcal`
          return (
            i.macros?.calories + ' kcal' || (
              <CustomSkeleton
                variant='text'
                width='25%'
                height={20}
                isDarkMode={prefs.isDarkMode}
              />
            )
          )
        }}
        renderLeft={(i) => {
          const item = cachedItems.find((item) => item.searchId === i.itemId)

          const img = item?.image || searchUrls.DEFAULT_IMAGE

          return img ? (
            <>
              <ListItemIcon className='item-image-container'>
                <img
                  src={img}
                  alt={i.name}
                  referrerPolicy='no-referrer'
                  onError={async (e) => {
                    await imageService.fetchOnError(e, item as Item)
                    loadItems()
                  }}
                />
              </ListItemIcon>
              <MacrosDonut
                protein={i.macros?.protein}
                carbs={i.macros?.carbs}
                fats={i.macros?.fat}
              />
            </>
          ) : (
            <CustomSkeleton
              variant='circular'
              width={40}
              height={40}
              isDarkMode={prefs.isDarkMode}
            />
          )
        }}
        onItemClick={handleItemClick}
        className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
      />
    )
  }

  return (
    <Card
      variant='outlined'
      className={`card logged-today-card ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <div
        className={`header-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <EventRepeatIcon />
        <Typography variant='h5'>Previous day logs</Typography>
        <Typography variant='caption'>{hebrewDate}</Typography>
        <Typography variant='h6'>{loggedToday?.calories} kcal</Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      </div>
      {renderList()}
    </Card>
  )
}
