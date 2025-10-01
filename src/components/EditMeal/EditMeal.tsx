import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { RootState } from '../../store/store'

import Typography from '@mui/material/Typography'

import Lottie from 'lottie-react'

import foodAnimation from '../../../public/food-animation.json'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SwipeAction } from 'react-swipeable-list'
import DeleteIcon from '@mui/icons-material/Delete'
import { MealItem } from '../../types/mealItem/MealItem'
import { setItem } from '../../store/actions/item.actions'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { MacrosDistribution } from '../MacrosDistribution/MacrosDistribution'
import { ItemSearch } from '../ItemSearch/ItemSearch'

import { CustomStepper } from '../../CustomMui/CustomStepper/CustomStepper'

const stages = ['name', 'items']

interface EditMealProps {
  selectedMeal?: Meal | null
  saveMeal: (meal: Meal) => void
}

export function EditMeal({ selectedMeal, saveMeal }: EditMealProps) {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const [editMeal, setEditMeal] = useState<Meal>(
    selectedMeal ||
      ({ ...mealService.getEmptyMeal(), createdBy: user?._id } as Meal)
  )
  const [stage, setStage] = useState<string>(stages[0])
  const [direction, setDirection] = useState(1)

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'search' | 'edit'>('search')

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

  const calcNewMealMacros = useCallback((newItems: MealItem[]) => {
    const newMacros = {
      calories: newItems.reduce((acc, item) => acc + item.macros.calories, 0),
      protein: newItems.reduce((acc, item) => acc + item.macros.protein, 0),
      carbs: newItems.reduce((acc, item) => acc + item.macros.carbs, 0),
      fat: newItems.reduce((acc, item) => acc + item.macros.fat, 0),
    }

    setEditMeal((prev) => ({ ...prev, items: newItems, macros: newMacros }))
  }, [])

  useEffect(() => {
    calcNewMealMacros(editMeal.items)
  }, [editMeal.items, calcNewMealMacros])

  const onStageChange = (targetStage: string, diff: number) => {
    if (_getDisabledNavButton(diff > 0 ? 'next' : 'previous')) return
    setDirection(diff > 0 ? 1 : -1)
    setStage(targetStage)
  }

  const onAddItem = () => {
    setIsOpenModal(true)
    setModalType('search')
  }
  const onFinish = () => {
    saveMeal(editMeal)
  }

  const renderStageContent = () => {
    if (stage === 'name')
      return (
        <div className='stage-container'>
          <CustomInput
            value={editMeal.name}
            onChange={(value) => onEditMeal('name', value)}
            placeholder='Meal Name'
          />
          <div className='animation-container'>
            <Lottie animationData={foodAnimation} loop={false} />
          </div>
        </div>
      )
    if (stage === 'items')
      return (
        <>
          <div className='stage-container'>
            <MacrosDistribution
              protein={editMeal.macros.protein}
              carbs={editMeal.macros.carbs}
              fats={editMeal.macros.fat}
              hideEditAndHeader={true}
              className={`edit-meal-macros-distribution`}
            />
            <CustomButton text='Add Item' fullWidth onClick={onAddItem} />
            <CustomList
              className={`edit-meal-list ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
              items={editMeal.items}
              renderPrimaryText={(item) => item.name}
              renderLeft={(item) => (
                <img className='item-image' src={item.image} alt={item.name} />
              )}
              renderSecondaryText={(item) =>
                `${+item.servingSize * +item.numberOfServings}gr`
              }
              getKey={(item) => item._id || item.searchId || ''}
              isSwipeable={true}
              renderRightSwipeActions={(item) => renderDeleteAction(item)}
              isDragable={true}
              onReorder={onReorder}
              onItemClick={onSelectItem}
              noResultsMessage={'No items added yet'}
              // renderSecondaryText={(item) =>
              //   `${+item.servingSize * +item.numberOfServings}gr - ${
              //     item.macros?.calories
              //   } kcal`
              // }
              // renderRight={(item) => <div>{item.name}</div>}
            />
          </div>
          <SlideDialog
            open={isOpenModal}
            onClose={onCloseItemDetails}
            component={
              modalType === 'search' ? (
                <ItemSearch onAddToMealClick={onAddToMealClick} />
              ) : (
                <ItemDetails onAddToMealClick={onAddToMealClick} />
              )
            }
            title='Item'
            onSave={() => {}}
            type='full'
          />
        </>
      )
  }

  const onDeleteItem = (item: MealItem) => {
    const newItems = editMeal.items.filter((i) => i.searchId !== item.searchId)
    setEditMeal({ ...editMeal, items: newItems })
  }

  function onReorder(newItems: MealItem[]) {
    setEditMeal({ ...editMeal, items: newItems })
  }

  function onSelectItem(item: MealItem) {
    const originalMacros = _calcOriginalMacros(item)
    setIsOpenModal(true)
    setModalType('edit')
    setItem({ ...item, macros: originalMacros })
  }

  function _calcOriginalMacros(item: MealItem) {
    const grams = item.servingSize * item.numberOfServings
    const calories = (item.macros.calories * 100) / grams
    const protein = (item.macros.protein * 100) / grams
    const carbs = (item.macros.carbs * 100) / grams
    const fat = (item.macros.fat * 100) / grams
    return {
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
    }
  }

  function onCloseItemDetails() {
    setIsOpenModal(false)
  }

  function onAddToMealClick(item: MealItem) {
    let newItems = []
    const hasIndex = editMeal.items.findIndex(
      (i) => i.searchId === item.searchId
    )

    if (hasIndex !== -1) {
      newItems = [...editMeal.items]
      newItems[hasIndex] = item
    } else {
      newItems = [...editMeal.items, item]
    }
    calcNewMealMacros(newItems)
    setIsOpenModal(false)
  }

  function renderDeleteAction(item: MealItem) {
    return (
      <SwipeAction destructive={true} onClick={() => onDeleteItem(item)}>
        <div className='swipeable-right-action delete'>
          <DeleteIcon className='delete-icon-button' />
          <Typography variant='body2'>Delete</Typography>
        </div>
      </SwipeAction>
    )
  }

  function _getDisabledNavButton(type: 'previous' | 'next') {
    if (type === 'previous' && stage === stages[0]) return true

    if (type === 'next') {
      if (stage === stages[stages.length - 1]) return true

      switch (stage) {
        case 'name':
          if (!editMeal.name) return true
          break
        case 'items':
          if (!editMeal.items.length) return true
          break

        default:
          break
      }
    }
    return false
  }

  return (
    <div className='page-container edit-meal-container'>
      <CustomStepper
        stages={stages}
        activeStage={stage}
        onStageChange={onStageChange}
        renderStage={renderStageContent}
        direction={direction}
        onFinish={onFinish}
        finishText='Save'
      />
    </div>
  )
}
