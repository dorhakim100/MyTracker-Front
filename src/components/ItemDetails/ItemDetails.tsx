import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'

import { Macros } from '../Macros/Macros'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { getArrayOfNumbers, getCurrMeal } from '../../services/util.service'
import Typography from '@mui/material/Typography'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'

import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import AddIcon from '@mui/icons-material/Add'

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
    values: getArrayOfNumbers(1, 100),
    type: 'clock',
  },
  {
    label: 'Meal',
    key: 'meal',
    values: ['Breakfast', 'Lunch', 'Dinner'],
    type: 'select',
  },
]

export function ItemDetails() {
  const item: Item = useSelector(
    (stateSelector: RootState) => stateSelector.itemModule.item
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [editItem, setEditItem] = useState<EditItem>({
    totalMacros: item.macros,
    servingSize: 100,
    numberOfServings: 1,
    meal: getCurrMeal(),
  })

  const [clockOpen, setClockOpen] = useState(false)

  useEffect(() => {
    console.log(editItem)
  }, [editItem])

  const closeClock = () => {
    setClockOpen(false)
  }
  const openClock = () => {
    setClockOpen(true)
  }

  const onEditItemChange = (key: string, value: string | number) => {
    console.log('onEditItemChange', key, value)

    let totalMacrosToSet = item.macros

    switch (key) {
      case 'servingSize':
        totalMacrosToSet = {
          calories: Math.round((+value / 100) * item.macros?.calories),
          protein: Math.round((+value / 100) * item.macros?.protein),
          carbs: Math.round((+value / 100) * item.macros?.carbs),
          fat: Math.round((+value / 100) * item.macros?.fat),
        }

        break

      case 'numberOfServings':
        totalMacrosToSet = {
          calories: Math.round(+value * item.macros?.calories),
          protein: Math.round(+value * item.macros?.protein),
          carbs: Math.round(+value * item.macros?.carbs),
          fat: Math.round(+value * item.macros?.fat),
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

  return (
    <div className='item-details'>
      <div className='header'>
        <div className='image'>
          <img src={item.image} alt={item.name} />
        </div>
        <div className='title'>{item.name}</div>
        <div className='subtitle'>{item.macros?.calories} kcal for 100g</div>

        <FavoriteButton />
      </div>

      <div className='content'>
        <div className='macros-container'>
          <MacrosDonut
            protein={editItem.totalMacros?.protein}
            carbs={editItem.totalMacros?.carbs}
            fats={editItem.totalMacros?.fat}
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
          {editOptions.map((option) => (
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
          ))}
        </div>
      </div>
      <Button
        variant='contained'
        color='primary'
        size='large'
        fullWidth
        className='add-to-meal-button'
      >
        <AddIcon sx={{ mr: 1 }} />
        Add to Meal
      </Button>
    </div>
  )
}

function ServingsSelect({
  openClock,
  option,
  value,
}: {
  openClock: () => void
  option: (typeof editOptions)[number]
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
import Button from '@mui/material/Button'
import { EditItem } from '../../types/editItem/editItem'

function EditComponent({
  value,
  onChange,
}: {
  value: number
  onChange: (key: keyof EditItem, value: number) => void
}) {
  const [pickerValue, setPickerValue] = useState<{
    numberOfServings: number
  }>({
    numberOfServings: value,
  })

  const values = getArrayOfNumbers(1, 150)

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
    setPickerValue((prev) => ({ ...prev, numberOfServings: value }))
  }, [value])

  useEffect(() => {
    onChange('numberOfServings', pickerValue.numberOfServings)
  }, [pickerValue.numberOfServings])

  return (
    <div className='picker-container'>
      <Picker
        value={pickerValue}
        onChange={(next) =>
          setPickerValue(next as unknown as { numberOfServings: number })
        }
      >
        <Picker.Column name='numberOfServings'>
          {values.map((number) => (
            <Picker.Item key={number} value={number}>
              {number}
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
      <div className='buttons-container'>
        {buttons.map((button) => (
          <Button
            variant='contained'
            key={`${button.value}-button`}
            onClick={() => onButtonClick(button.value)}
          >
            {button.value}
          </Button>
        ))}
      </div>
    </div>
  )
}
