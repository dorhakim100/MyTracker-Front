import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { RootState } from '../../store/store'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { capitalizeFirstLetter } from '../../services/util.service'
import { AnimatePresence, motion } from 'framer-motion'
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
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

const stages = ['name', 'items']

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 360 : -360, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -360 : 360, opacity: 0 }),
}

interface EditMealProps {
  selectedMeal?: Meal | null
  saveMeal: (meal: Meal) => void
}

export function EditMeal({ selectedMeal, saveMeal }: EditMealProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
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

  // const onSaveMeal = () => {
  //   console.log('editMeal', editMeal)
  //   // mealService.save(editMeal)
  // }

  useEffect(() => {
    // console.log('editMeal', editMeal)
    calcNewMealMacros(editMeal.items)
  }, [editMeal.items])

  const onChangeStage = (diff: number) => {
    if (_getDisabledNavButton(diff > 0 ? 'next' : 'previous')) return
    const next = stages.indexOf(stage) + diff
    setDirection(diff > 0 ? 1 : -1)
    setStage(stages[next])
  }

  const onAddItem = () => {
    setIsOpenModal(true)
    setModalType('search')
  }
  const onSaveMeal = () => {
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
              className='edit-meal-list'
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

  const renderNavigationFooter = () => {
    return (
      <div className='edit-meal-footer'>
        <Stepper
          activeStep={stages.indexOf(stage)}
          alternativeLabel
          className={`stepper ${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor
          }`}
        >
          {stages.map((stage) => (
            <Step key={stage}>
              <StepLabel>{capitalizeFirstLetter(stage)}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div className='buttons-container'>
          <CustomButton
            text='Previous'
            onClick={() => onChangeStage(-1)}
            fullWidth
            disabled={_getDisabledNavButton('previous')}
          />
          {stage === stages[stages.length - 1] ? (
            <CustomButton
              text='Save'
              onClick={onSaveMeal}
              fullWidth
              icon={<ArrowRightAltIcon />}
              disabled={editMeal.items.length === 0}
            />
          ) : (
            <CustomButton
              text='Next'
              onClick={() => onChangeStage(1)}
              fullWidth
              disabled={_getDisabledNavButton('next')}
            />
          )}
        </div>
      </div>
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

  function calcNewMealMacros(newItems: MealItem[]) {
    const newMacros = {
      calories: newItems.reduce((acc, item) => acc + item.macros.calories, 0),
      protein: newItems.reduce((acc, item) => acc + item.macros.protein, 0),
      carbs: newItems.reduce((acc, item) => acc + item.macros.carbs, 0),
      fat: newItems.reduce((acc, item) => acc + item.macros.fat, 0),
    }

    setEditMeal({ ...editMeal, items: newItems, macros: newMacros })
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
      <Typography variant='h6'>
        {stage === 'name' ? 'Enter Meal Name' : editMeal.name}
      </Typography>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='stage-container'>
        <AnimatePresence initial={false} custom={direction} mode='wait'>
          <motion.div
            key={stage}
            custom={direction}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ type: 'tween', duration: 0.25 }}
          >
            {renderStageContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {renderNavigationFooter()}
    </div>
  )
}
