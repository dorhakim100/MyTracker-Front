import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'

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
        <div className='subtitle'>{item.macros?.calories} kcal</div>
      </div>

      <div className='content'>
        <div className='macros'>
          <div className='macro'>Protein: {item.macros?.protein} g</div>
          <div className='macro'>Carbs: {item.macros?.carbs} g</div>
          <div className='macro'>Fats: {item.macros?.fat} g</div>
        </div>
      </div>
    </div>
  )
}
