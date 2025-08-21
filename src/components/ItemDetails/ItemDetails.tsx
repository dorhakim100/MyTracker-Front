import React from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'

import { Macros } from '../Macros/Macros'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'

export function ItemDetails() {
  const item: Item = useSelector(
    (stateSelector: RootState) => stateSelector.itemModule.item
  )

  return (
    <div className='item-details'>
      <div className='header'>
        <div className='image'>
          <img src={item.image} alt={item.name} />
        </div>
        <div className='title'>{item.name}</div>
        <div className='subtitle'>{item.macros?.calories} kcal for 100g</div>
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
    </div>
  )
}
