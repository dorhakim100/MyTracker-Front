import { useEffect, useState } from 'react'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Meal } from '../../types/meal/Meal'

export function EditMeal() {
  const [editMeal, setEditMeal] = useState<Meal>({
    _id: '',
    name: '',
    items: [],
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  })

  const onEditMeal = (key: keyof Meal, value: string | number) => {
    const newEditMeal = { ...editMeal }
    switch (key) {
      case 'name':
        newEditMeal.name = value as string
        break
      // case 'items':
      // setEditMeal({ ...editMeal, items: value as string[] })
      // break

      default:
        break
    }

    setEditMeal(newEditMeal)
  }

  useEffect(() => {
    console.log('editMeal', editMeal)
  }, [editMeal])

  return (
    <div className='page-container edit-meal-container'>
      <CustomInput
        value={editMeal.name}
        onChange={(value) => onEditMeal('name', value)}
        placeholder='Meal Name'
      />
    </div>
  )
}
