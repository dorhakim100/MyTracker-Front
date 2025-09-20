import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'
import { cache } from '../../assets/config/cache'

import { Macros } from '../Macros/Macros'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { getArrayOfNumbers, getCurrMeal } from '../../services/util.service'
import { searchService } from '../../services/search/search-service'
import Typography from '@mui/material/Typography'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'

import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import AddIcon from '@mui/icons-material/Add'
import { logService } from '../../services/log/log.service'
import { MealItem } from '../../types/mealItem/MealItem'
import { Meal } from '../../types/meal/Meal'

interface ItemDetailsProps {
  onAddToMealClick?: (item: MealItem) => void
}

interface EditOption {
  label: string
  key: string
  values: string[] | number[]
  type: string
}

export function ItemDetails({ onAddToMealClick }: ItemDetailsProps) {
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
    totalMacros: item.macros,
    servingSize: editMealItem?.servingSize || 100,
    numberOfServings: editMealItem?.numberOfServings || 1,
    meal: editMealItem?.meal || selectedMeal || getCurrMeal(),
  })

  const [clockOpen, setClockOpen] = useState(false)

  const editOptions = [
    {
      label: 'Serving Size',
      key: 'servingSize',
      values: [1, 25, 30, 50, 100, 150],
      extra: 'gram',
      type: 'select',
    },
    {
      label: 'Number of Servings',
      key: 'numberOfServings',
      values: getArrayOfNumbers(0, 100),
      type: 'clock',
    },
    {
      label: 'Meal',
      key: 'meal',
      values: ['Breakfast', 'Lunch', 'Dinner'],
      type: 'select',
    },
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

  const onEditItemChange = (key: string, value: string | number) => {
    // let totalMacrosToSet = item.macros
    let totalMacrosToSet = searchedItem.macros
    switch (key) {
      case 'servingSize':
        totalMacrosToSet = {
          calories: Math.round(
            // (+value / 100) * item.macros?.calories * editItem.numberOfServings
            (+value / 100) *
              searchedItem.macros?.calories *
              editItem.numberOfServings
          ),
          protein: Math.round(
            // (+value / 100) * item.macros?.protein * editItem.numberOfServings
            (+value / 100) *
              searchedItem.macros?.protein *
              editItem.numberOfServings
          ),
          carbs: Math.round(
            // (+value / 100) * item.macros?.carbs * editItem.numberOfServings
            (+value / 100) *
              searchedItem.macros?.carbs *
              editItem.numberOfServings
          ),
          fat: Math.round(
            // (+value / 100) * item.macros?.fat * editItem.numberOfServings
            (+value / 100) *
              searchedItem.macros?.fat *
              editItem.numberOfServings
          ),
        }

        break

      case 'numberOfServings':
        totalMacrosToSet = {
          calories: Math.round(
            // (+value * item.macros?.calories * editItem.servingSize) / 100
            (+value * searchedItem.macros?.calories * editItem.servingSize) /
              100
          ),
          protein: Math.round(
            // (+value * item.macros?.protein * editItem.servingSize) / 100
            (+value * searchedItem.macros?.protein * editItem.servingSize) / 100
          ),
          carbs: Math.round(
            // (+value * item.macros?.carbs * editItem.servingSize) / 100
            (+value * searchedItem.macros?.carbs * editItem.servingSize) / 100
          ),
          fat: Math.round(
            // (+value * item.macros?.fat * editItem.servingSize) / 100
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
    }

    setEditItem((prev) => ({
      ...prev,
      [key]: +value,
      totalMacros: totalMacrosToSet,
    }))
  }

  const onFavoriteClick = async () => {
    try {
      if (!user) return showErrorMsg(messages.error.favorite)
      if (!searchedItem.searchId) return showErrorMsg(messages.error.favorite)

      await handleFavorite(searchedItem, user)
    } catch {
      showErrorMsg(messages.error.favorite)
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
                item.searchId.length < LONGEST_FOOD_ID_LENGTH
                  ? searchTypes.usda
                  : searchTypes.openFoodFacts,
              createdBy: user._id,
            }
          })
          .filter((log) => log !== null)

        if (!logsToAdd.length) return showErrorMsg(messages.error.addLog)

        // setSelectedMeal(null)
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

      await searchService.addToCache(itemToCache, cache.ITEMS_CACHE)

      const newLog = {
        itemId: item.searchId,
        meal: editItem.meal,
        macros: editItem.totalMacros,
        time: Date.now(),
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,
        source: searchedItem.type,
        createdBy: user._id,
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
      showErrorMsg(messages.error.favorite)
      // optimisticUpdateUser(user as User)
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
      }

      delete newLog.image
      delete newLog.name
      delete newLog.searchId

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
        searchId: item.searchId,
        name: item.name,
        macros: editItem.totalMacros,
        image: item.image,
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,
      }
      return () => onAddToMealClick(itemMealToEdit as MealItem)
    }
    if (editMealItem) {
      return onEditMeal
    }
    return onAddToMeal
  }

  return (
    <div className='item-details'>
      <div className='header'>
        <div className='image'>
          <img src={item.image} alt={item.name} />
        </div>
        <div className='title'>{item.name}</div>
        <div className='subtitle'>{`${item.macros?.calories} kcal for ${
          !_hasItems(item) ? '100g' : 'serving'
        }`}</div>

        {!_hasItems(item) && (
          <div className='favorite-container' onClick={onFavoriteClick}>
            <FavoriteButton
              isFavorite={searchService.isFavorite(searchedItem, user) || false}
            />
          </div>
        )}
      </div>

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
          {editOptions.map((option) => {
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
                {option.type === 'select' && (
                  <CustomSelect
                    label={option.label}
                    values={option.values.map((value) => value.toString())}
                    extra={option.extra}
                    value={editItem[option.key as keyof EditItem].toString()}
                    onChange={(value) => onEditItemChange(option.key, value)}
                  />
                )}
                {option.type === 'clock' && (
                  <>
                    <ServingsSelect
                      openClock={openClock}
                      option={option}
                      value={editItem.numberOfServings}
                    />
                    <SlideDialog
                      open={clockOpen}
                      onClose={closeClock}
                      component={
                        <EditComponent
                          value={editItem.numberOfServings}
                          onChange={onEditItemChange}
                        />
                      }
                      onSave={() => {}}
                      title={option.label}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <CustomButton
        text={editMealItem ? 'Edit Meal' : 'Add to Meal'}
        icon={!editMealItem && <AddIcon sx={{ mr: 1 }} />}
        size='large'
        fullWidth
        className={`add-to-meal-button ${prefs.favoriteColor}`}
        onClick={getOnClick()}
      />
    </div>
  )
}

function ServingsSelect({
  openClock,
  option,
  value,
}: {
  openClock: () => void
  option: EditOption
  value: number
}) {
  return (
    <FormControl sx={{ m: 1, minWidth: 150 }} size='small' onClick={openClock}>
      <InputLabel id={`${option.label}-label`}>{option.label}</InputLabel>
      <Select
        labelId={`${option.label}-label`}
        label={option.label}
        value={value}
        open={false}
        onOpen={() => {}}
        renderValue={(selected) => `${selected}`}
      >
        <MenuItem
          sx={{
            display: 'none',
          }}
          value={value}
        >
          {value}
        </MenuItem>
      </Select>
    </FormControl>
  )
}

import Picker from 'react-mobile-picker'
import { EditItem } from '../../types/editItem/editItem'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import {
  handleFavorite,
  optimisticUpdateUser,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { loadItems, setSelectedMeal } from '../../store/actions/item.actions'
import { User } from '../../types/user/User'
import { dayService } from '../../services/day/day.service'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { searchTypes } from '../../assets/config/search-types'
import { Log } from '../../types/log/Log'

function EditComponent({
  value,
  onChange,
}: {
  value: number
  onChange: (key: keyof EditItem, value: number) => void
}) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerValue, setPickerValue] = useState<{
    numberOfServings: number
    afterValue: number
  }>({
    numberOfServings: value,
    afterValue: 0,
  })

  const values = getArrayOfNumbers(0, 150)
  const afterValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  const buttons = [
    {
      value: 1,
      onClick: onButtonClick,
    },
    {
      value: 50,
      onClick: onButtonClick,
    },
    {
      value: 100,
      onClick: onButtonClick,
    },
  ]

  function onButtonClick(value: number) {
    setPickerValue({
      ...pickerValue,
      numberOfServings: value,
    })
  }

  // Keep picker in sync with external value
  useEffect(() => {
    const firstValue = Math.floor(value)
    let secondValue = Math.round((value - firstValue) * 10) / 10
    if (firstValue === 0 && secondValue === 0) {
      secondValue = 0.1
    }

    setPickerValue((prev) => ({
      ...prev,
      numberOfServings: firstValue,
      afterValue: secondValue,
    }))
  }, [value])

  //   useEffect(() => {
  //     const newValue = pickerValue.numberOfServings + pickerValue.afterValue
  //     console.log('newValue', newValue)
  //     onChange('numberOfServings', newValue)
  //   }, [pickerValue.numberOfServings])
  useEffect(() => {
    const newValue = pickerValue.numberOfServings + pickerValue.afterValue
    onChange('numberOfServings', newValue)
  }, [pickerValue])

  //   useEffect(() => {
  //     const newValue = pickerValue.numberOfServings + pickerValue.afterValue
  //     console.log('newValue', newValue)
  //     onChange('numberOfServings', newValue)
  //   }, [pickerValue.afterValue])

  return (
    <div className='picker-container'>
      <Picker
        value={pickerValue}
        onChange={(next) =>
          setPickerValue(
            next as unknown as { numberOfServings: number; afterValue: number }
          )
        }
      >
        <Picker.Column name='numberOfServings'>
          {values.map((number) => (
            <Picker.Item key={number} value={number}>
              {number}
            </Picker.Item>
          ))}
        </Picker.Column>
        <Picker.Column name='afterValue'>
          {afterValues.map((number) => (
            <Picker.Item key={number} value={number}>
              {number}
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
      <div className='buttons-container'>
        {buttons.map((button) => (
          <CustomButton
            key={`${button.value}-button`}
            onClick={() => onButtonClick(button.value)}
            className={`${prefs.favoriteColor}`}
            text={button.value.toString()}
            fullWidth
          />
        ))}
      </div>
    </div>
  )
}
