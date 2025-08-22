import { useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'

import { Macros } from '../Macros/Macros'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { getArrayOfNumbers } from '../../services/util.service'
import Typography from '@mui/material/Typography'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'

import InputLabel from '@mui/material/InputLabel'

const editOptions = [
  {
    label: 'Serving Size',
    values: [1, 25, 30, 50, 100, 150],
    extra: 'gram',
    type: 'select',
  },
  {
    label: 'Number of Servings',
    values: getArrayOfNumbers(1, 100),
    type: 'clock',
  },
  {
    label: 'Meal',
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

  const [clockOpen, setClockOpen] = useState(false)

  const closeClock = () => {
    setClockOpen(false)
  }
  const openClock = () => {
    setClockOpen(true)
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
            protein={item.macros?.protein}
            carbs={item.macros?.carbs}
            fats={item.macros?.fat}
          />
          <Macros
            protein={item.macros?.protein}
            carbs={item.macros?.carbs}
            fats={item.macros?.fat}
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
                  values={option.values}
                  extra={option.extra}
                />
              )}
              {option.type === 'clock' && (
                <>
                  <FormControl
                    sx={{ m: 1, minWidth: 150 }}
                    size='small'
                    onClick={openClock}
                  >
                    <InputLabel id={`${option.label}-label`}>
                      {option.label}
                    </InputLabel>
                    <Select
                      open={false}
                      onOpen={() => {}}
                      // Keep the Select visually enabled but prevent its native menu
                      // from opening. The parent FormControl click opens the clock dialog.
                    />
                  </FormControl>
                  <SlideDialog
                    open={clockOpen}
                    onClose={closeClock}
                    component={<EditComponent />}
                    onSave={() => {}}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditComponent() {
  return <div>EditComponent</div>
}
