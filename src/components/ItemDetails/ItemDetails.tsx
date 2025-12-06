import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'
import { cache } from '../../assets/config/cache'

import { Macros } from '../Macros/Macros'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { getArrayOfNumbers, getCurrMeal } from '../../services/util.service'
import { searchService } from '../../services/search/search-service'
import Typography from '@mui/material/Typography'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import AddIcon from '@mui/icons-material/Add'
import { logService } from '../../services/log/log.service'
import { MealItem } from '../../types/mealItem/MealItem'
import { Meal } from '../../types/meal/Meal'
import { Log } from '../../types/log/Log'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { User } from '../../types/user/User'

import { Macros as MacrosType } from '../../types/macros/Macros'
import { EditItem } from '../../types/editItem/editItem'
import { searchTypes } from '../../assets/config/search-types'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { EditMacros } from '../MacrosProgress/EditMacros'
import { calculateProteinCalories } from '../../services/macros/macros.service'
import { calculateCarbCalories } from '../../services/macros/macros.service'
import { calculateFatCalories } from '../../services/macros/macros.service'
import EditIcon from '@mui/icons-material/Edit'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import {
  handleFavorite,
  optimisticUpdateUser,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { dayService } from '../../services/day/day.service'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { imageService } from '../../services/image/image.service'
import { loadItems, setSelectedMeal } from '../../store/actions/item.actions'
import { ClockPicker } from '../Pickers/ClockPicker'
import { PickerSelect } from '../Pickers/PickerSelect'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'

interface ItemDetailsProps {
  onAddToMealClick?: (item: MealItem) => void
  noEdit?: boolean
  isCustomLog?: boolean
}

interface EditOption {
  label: string
  key: string
  values?: string[] | number[]
  type?: string
  extra?: string
}

const MEAL_INPUT = {
  label: 'Meal',
  key: 'meal',
  values: ['Breakfast', 'Lunch', 'Dinner'],
  type: 'select',
  extra: '',
}

const NUMBER_OF_SERVINGS_INPUT = {
  label: 'Number of Servings',
  key: 'numberOfServings',
  values: getArrayOfNumbers(0, 100),
  type: 'clock',
  extra: '',
}

export function ItemDetails({
  onAddToMealClick,
  noEdit = false,
  isCustomLog = false,
}: ItemDetailsProps) {
  const searchedItem: Item = useSelector(
    (stateSelector: RootState) => stateSelector.itemModule.item
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const editMealItem = useSelector(
    (stateSelector: RootState) => stateSelector.itemModule.editMealItem
  )

  const selectedMeal = useSelector(
    (stateSelector: RootState) => stateSelector.itemModule.selectedMeal
  )

  const selectedDay = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.selectedDay
  )

  const item: Item | Meal | Log = editMealItem ? editMealItem : searchedItem

  const [editItem, setEditItem] = useState<EditItem>({
    totalMacros: isCustomLog ? _getDefaultMacros() : item.macros,
    servingSize: editMealItem?.servingSize || 100,
    numberOfServings: editMealItem?.numberOfServings || 1,
    meal: editMealItem?.meal || selectedMeal || getCurrMeal(),
    name: isCustomLog ? '' : editMealItem?.name || searchedItem.name,
  })

  const [clockOpen, setClockOpen] = useState(false)
  const [macrosOpen, setMacrosOpen] = useState(false)

  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const editOptions: EditOption[] =
    !isCustomLog && (item as Log).source !== searchTypes.custom
      ? [
          {
            label: 'Serving Size',
            key: 'servingSize',
            values: [1, 25, 30, 50, 100, 150],
            extra: 'gram',
            type: 'select',
          },
          NUMBER_OF_SERVINGS_INPUT,
          MEAL_INPUT,
        ]
      : [
          {
            label: 'Macros',
            key: 'custom-log-macros',

            type: 'macros',
            extra: '',
            values: [],
          },
          NUMBER_OF_SERVINGS_INPUT,
          MEAL_INPUT,
        ]

  useEffect(() => {
    loadItems()
  }, [])

  const closeClock = () => {
    setClockOpen(false)
  }
  const openClock = () => {
    setClockOpen(true)
  }

  const closeMacros = () => {
    setMacrosOpen(false)
  }
  const openMacros = () => {
    setMacrosOpen(true)
  }

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const onEditItemChange = (key: string, value: string | number) => {
    let totalMacrosToSet = searchedItem.macros
    switch (key) {
      case 'servingSize':
        totalMacrosToSet = {
          calories: Math.round(
            (+value / 100) *
              searchedItem.macros?.calories *
              editItem.numberOfServings
          ),
          protein: Math.round(
            (+value / 100) *
              searchedItem.macros?.protein *
              editItem.numberOfServings
          ),
          carbs: Math.round(
            (+value / 100) *
              searchedItem.macros?.carbs *
              editItem.numberOfServings
          ),
          fat: Math.round(
            (+value / 100) *
              searchedItem.macros?.fat *
              editItem.numberOfServings
          ),
        }

        break

      case 'numberOfServings':
        totalMacrosToSet = {
          calories: Math.round(
            (+value * searchedItem.macros?.calories * editItem.servingSize) /
              100
          ),
          protein: Math.round(
            (+value * searchedItem.macros?.protein * editItem.servingSize) / 100
          ),
          carbs: Math.round(
            (+value * searchedItem.macros?.carbs * editItem.servingSize) / 100
          ),
          fat: Math.round(
            (+value * searchedItem.macros?.fat * editItem.servingSize) / 100
          ),
        }
        break

      case 'meal':
        setEditItem((prev) => ({
          ...prev,
          [key]: value as string,
        }))
        return

      case 'name':
        setEditItem((prev) => ({
          ...prev,
          [key]: value as string,
        }))
        return
    }

    setEditItem((prev) => ({
      ...prev,
      [key]: +value,
      totalMacros: totalMacrosToSet,
    }))
  }

  const onFavoriteClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      e.stopPropagation()
      if (!user) return showErrorMsg(messages.error.favorite)
      if (!searchedItem.searchId) return showErrorMsg(messages.error.favorite)

      await handleFavorite(searchedItem, user)
    } catch {
      showErrorMsg(messages.error.favorite)
    }
  }

  function _getDefaultMacros() {
    const protein = 15
    const carbs = 20
    const fats = 5
    const calories =
      calculateProteinCalories(protein) +
      calculateCarbCalories(carbs) +
      calculateFatCalories(fats)
    return {
      calories,
      protein,
      carbs,
      fat: fats,
    }
  }

  function _hasItems(
    x: Item | Meal | Log
  ): x is Meal | (Item & { items: MealItem[] }) {
    return Array.isArray((x as Item & { items: MealItem[] }).items)
  }

  const onAddToMeal = async () => {
    try {
      if (!user || !selectedDay) return showErrorMsg(messages.error.addLog)

      if (!item.searchId && _hasItems(item)) {
        const LONGEST_FOOD_ID_LENGTH = 10

        const mealNumberOfServings = editItem.numberOfServings

        const logsToAdd = item.items
          .map((item: MealItem) => {
            if (!item.searchId) return null

            return {
              itemId: item.searchId,
              meal: editItem.meal,
              macros: {
                calories: item.macros.calories * mealNumberOfServings,
                protein: item.macros.protein * mealNumberOfServings,
                carbs: item.macros.carbs * mealNumberOfServings,
                fat: item.macros.fat * mealNumberOfServings,
              },
              time: Date.now(),
              servingSize: item.servingSize,
              numberOfServings: item.numberOfServings * mealNumberOfServings,
              source:
                isCustomLog || item.source === searchTypes.custom
                  ? searchTypes.custom
                  : item.searchId.length < LONGEST_FOOD_ID_LENGTH
                  ? searchTypes.usda
                  : searchTypes.openFoodFacts,
              createdBy: user._id,
              name:
                isCustomLog || item.source === searchTypes.custom
                  ? editItem.name
                  : '',
            }
          })
          .filter((log) => log !== null)

        if (!logsToAdd.length) return showErrorMsg(messages.error.addLog)

        const logsToSave = logsToAdd.map(async (log: Log) => {
          return await logService.save(log)
        })
        const savedLogs = await Promise.all(logsToSave)
        const savedLogsCalories = savedLogs.reduce(
          (acc: number, log) => acc + log.macros.calories,
          0
        )
        const dayToSave = {
          ...selectedDay,
          logs: [...selectedDay.logs, ...savedLogs],
          calories: selectedDay.calories + savedLogsCalories,
        }

        const todayId = user?.loggedToday._id

        let newToday

        if (selectedDay?._id === todayId) {
          newToday = {
            ...user.loggedToday,
            logs: [...user.loggedToday.logs, ...savedLogs],
            calories: user.loggedToday.calories + savedLogsCalories,
          }
          const newUser = {
            ...user,
            loggedToday: newToday,
          }
          optimisticUpdateUser(newUser)
          setSelectedDiaryDay(newToday)
        }

        await dayService.save(dayToSave as LoggedToday)

        setSelectedDiaryDay(dayToSave as LoggedToday)

        showSuccessMsg(messages.success.addedToMeal)
        return
      }

      const itemToCache = {
        ...searchedItem,
      }
      delete itemToCache._id

      if (!isCustomLog)
        await searchService.addToCache(itemToCache, cache.ITEMS_CACHE)

      const newLog = {
        itemId: isCustomLog ? '' : item.searchId,
        meal: editItem.meal,
        macros: editItem.totalMacros,
        time: Date.now(),
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,
        source: isCustomLog ? searchTypes.custom : searchedItem.type,
        createdBy: user._id,
        name: isCustomLog ? editItem.name : '',
      }

      setSelectedMeal(null)
      const savedLog = await logService.save(newLog as Log)
      const dayToSave = {
        ...selectedDay,
        logs: [...selectedDay.logs, savedLog],
        calories: selectedDay.calories + savedLog.macros.calories,
      }

      const todayId = user?.loggedToday._id

      let newToday

      if (selectedDay?._id === todayId) {
        newToday = {
          ...user.loggedToday,
          logs: [...user.loggedToday.logs, savedLog],
          calories: user.loggedToday.calories + savedLog.macros.calories,
        }
        const newUser = {
          ...user,
          loggedToday: newToday,
        }
        optimisticUpdateUser(newUser)
        setSelectedDiaryDay(newToday)
      }

      await dayService.save(dayToSave as LoggedToday)

      setSelectedDiaryDay(dayToSave as LoggedToday)

      showSuccessMsg(messages.success.addedToMeal)
    } catch {
      showErrorMsg(messages.error.addLog)
    }
  }

  async function onEditMeal() {
    try {
      if (!editMealItem) return showErrorMsg(messages.error.editMeal)

      const newLog = {
        ...editMealItem,
        macros: editItem.totalMacros,
        meal: editItem.meal,
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,

        name:
          isCustomLog || (item as Log).source === searchTypes.custom
            ? editItem.name
            : editMealItem.name,
      }

      delete newLog.image
      delete newLog.searchId
      if (!isCustomLog && (item as Log).source !== searchTypes.custom)
        delete newLog.name

      const userLogs = selectedDay?.logs

      if (!userLogs) return showErrorMsg(messages.error.editMeal)
      const logIndex = userLogs.findIndex(
        (log) => log.time === editMealItem.time
      )
      if (logIndex === -1) return showErrorMsg(messages.error.editMeal)

      const newLogs = [...userLogs]
      newLogs[logIndex] = newLog

      const newCalories = newLogs.reduce(
        (acc, log) => acc + log.macros.calories,
        0
      )

      if (selectedDay?._id === user?.loggedToday._id) {
        const newUser = {
          ...user,
          loggedToday: {
            ...user?.loggedToday,
            logs: newLogs,
            calories: newCalories,
          },
        }

        optimisticUpdateUser(newUser as User)
        setSelectedMeal(null)
        await logService.save(newLog)

        setSelectedDiaryDay(newUser.loggedToday as LoggedToday)
        await dayService.save(newUser.loggedToday as LoggedToday)
      } else {
        const newSelectedDay = {
          ...selectedDay,
          logs: newLogs,
          calories: newCalories,
        }
        await logService.save(newLog)
        setSelectedDiaryDay(newSelectedDay as LoggedToday)
        await dayService.save(newSelectedDay as LoggedToday)
      }

      showSuccessMsg(messages.success.saveMeal)
    } catch (err) {
      console.log(err)
      showErrorMsg(messages.error.saveMeal)
      optimisticUpdateUser(user as User)
    }
  }

  const getOnClick = () => {
    if (onAddToMealClick) {
      const itemMealToEdit = {
        searchId: isCustomLog ? '' : item.searchId,
        name: isCustomLog ? editItem.name : item.name || editItem.name,
        macros: editItem.totalMacros,
        image: item.image,
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,
        source: isCustomLog ? searchTypes.custom : null,
      }

      return () => onAddToMealClick(itemMealToEdit as MealItem)
    }
    if (editMealItem) {
      return onEditMeal
    }
    return onAddToMeal
  }

  const onEditCustomLog = (macros: MacrosType) => {
    setEditItem((prev) => ({
      ...prev,
      totalMacros: macros,
    }))
  }

  const renderErrorImage = () => {
    if (editMealItem) editMealItem.image = undefined
    if (searchedItem) searchedItem.image = undefined
  }

  return (
    <>
      <div
        className={`item-details ${noEdit ? 'no-edit' : ''} ${
          isCustomLog ? 'custom-log' : ''
        }`}
      >
        {(!isCustomLog && (item as Log).source !== searchTypes.custom && (
          <div className='header' onClick={openImageModal}>
            <div className='image box-shadow white-outline'>
              {(item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy='no-referrer'
                  onError={async (e) => {
                    renderErrorImage()
                    await imageService.fetchOnError(e, item as Item)
                    loadItems()
                  }}
                />
              )) || (
                <CustomSkeleton
                  variant='circular'
                  width={60}
                  height={60}
                  isDarkMode={prefs.isDarkMode}
                />
              )}
            </div>
            <div className='title'>{item.name}</div>
            <div className='subtitle'>{`${(+item.macros?.calories).toFixed(
              0
            )} kcal for ${!_hasItems(item) ? '100g' : 'serving'}`}</div>

            {!noEdit && !_hasItems(item) && (
              <div className='favorite-container' onClick={onFavoriteClick}>
                <FavoriteButton
                  isFavorite={
                    searchService.isFavorite(searchedItem, user) || false
                  }
                />
              </div>
            )}
          </div>
        )) || (
          <CustomInput
            value={editItem.name || ''}
            onChange={(value) => onEditItemChange('name', value)}
            placeholder='Name'
            className={`${prefs.favoriteColor}`}
          />
        )}

        <div className='content'>
          <div className='macros-container'>
            <MacrosDonut
              protein={editItem.totalMacros?.protein}
              carbs={editItem.totalMacros?.carbs}
              fats={editItem.totalMacros?.fat}
              calories={editItem.totalMacros?.calories}
            />
            <Macros
              protein={editItem.totalMacros?.protein}
              carbs={editItem.totalMacros?.carbs}
              fats={editItem.totalMacros?.fat}
            />
          </div>
        </div>

        <div className='edit'>
          <div className='selects-container'>
            {!noEdit &&
              editOptions.map((option) => {
                if (onAddToMealClick && option.key === 'meal') return null

                if (
                  !item.searchId &&
                  _hasItems(item) &&
                  option.key === 'servingSize'
                )
                  return null
                return (
                  <div
                    className={`select-container ${
                      prefs.isDarkMode ? 'dark-mode' : ''
                    }`}
                    key={option.label}
                  >
                    <Typography variant='h6'>{option.label}</Typography>
                    {option.type === 'select' && option.values && (
                      <CustomSelect
                        label={option.label}
                        values={option.values.map((value) => value.toString())}
                        extra={option.extra}
                        value={
                          editItem[option.key as keyof EditItem]?.toString() ||
                          ''
                        }
                        onChange={(value) =>
                          onEditItemChange(option.key, value)
                        }
                      />
                    )}
                    {option.type === 'clock' && (
                      <>
                        <PickerSelect
                          openClock={openClock}
                          option={option}
                          value={editItem.numberOfServings}
                        />
                        <SlideDialog
                          open={clockOpen}
                          onClose={closeClock}
                          component={
                            <ClockPicker
                              value={editItem.numberOfServings}
                              onChange={onEditItemChange}
                            />
                          }
                          title={option.label}
                        />
                      </>
                    )}
                    {option.type === 'macros' && (
                      <>
                        <CustomButton
                          text='Edit Macros'
                          onClick={openMacros}
                          icon={<EditIcon />}
                        />
                        <SlideDialog
                          open={macrosOpen}
                          onClose={closeMacros}
                          component={
                            <EditMacros
                              isCustomLog={
                                isCustomLog ||
                                (item as Log).source === searchTypes.custom
                              }
                              protein={editItem.totalMacros?.protein || 0}
                              carbs={editItem.totalMacros?.carbs || 0}
                              fats={editItem.totalMacros?.fat || 0}
                              editCustomLog={onEditCustomLog}
                            />
                          }
                        />
                      </>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
        {!noEdit && (
          <CustomButton
            text={editMealItem ? 'Edit Meal' : 'Add to Meal'}
            icon={!editMealItem && <AddIcon sx={{ mr: 1 }} />}
            size='large'
            fullWidth
            className={`add-to-meal-button ${prefs.favoriteColor}`}
            onClick={getOnClick()}
          />
        )}
      </div>
      {item.image && (
        <CustomAlertDialog
          open={isImageModalOpen}
          onClose={closeImageModal}
          title={item.name || ''}
        >
          <div className='modal-image-container'>
            <img
              src={item.image}
              alt={item.name}
              className={`box-shadow white-outline`}
              referrerPolicy='no-referrer'
              onError={async (e) => {
                await imageService.fetchOnError(e, item as Item)
                loadItems()
              }}
            />
          </div>
          <CustomButton
            text='Cancel'
            fullWidth
            onClick={closeImageModal}
            className={`${prefs.favoriteColor}`}
          />
        </CustomAlertDialog>
      )}
    </>
  )
}
