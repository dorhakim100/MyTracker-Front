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

const stages = ['name', 'items']

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 360 : -360, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -360 : 360, opacity: 0 }),
}

export function EditMeal() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [editMeal, setEditMeal] = useState<Meal>({
    ...mealService.getEmptyMeal(),
    macros: { calories: 3567, protein: 200, carbs: 200, fat: 200 },
    items: [
      {
        _id: '12q345',
        searchId: '12345',
        image:
          'https://domf5oio6qrcr.cloudfront.net/medialibrary/8371/bigstock-Hamburger-And-French-Fries-263887.jpg',
        name: 'Item 1',
        macros: { calories: 100, protein: 10, carbs: 10, fat: 10 },
        type: 'food',
        servingSize: 100,
        numberOfServings: 1,
      },
      {
        _id: '234v56',
        searchId: '23456',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYh_GM0PimdSFWCXk0jE-GWGRYGXmno2muj__ddRNSy9gp87R9IMwDY_kWWRbdvrO0Zdc&usqp=CAU',
        name: 'Item 2',
        macros: { calories: 62, protein: 5, carbs: 2, fat: 4 },
        type: 'food',
        servingSize: 50,
        numberOfServings: 3,
      },
      {
        _id: '34c567',
        searchId: '34567',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYh_GM0PimdSFWCXk0jE-GWGRYGXmno2muj__ddRNSy9gp87R9IMwDY_kWWRbdvrO0Zdc&usqp=CAU',
        name: 'Item 3',
        macros: { calories: 62, protein: 5, carbs: 2, fat: 4 },
        type: 'food',
        servingSize: 50,
        numberOfServings: 3,
      },
      {
        _id: '456q78',
        searchId: '45678',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYh_GM0PimdSFWCXk0jE-GWGRYGXmno2muj__ddRNSy9gp87R9IMwDY_kWWRbdvrO0Zdc&usqp=CAU',
        name: 'Item 4',
        macros: { calories: 62, protein: 5, carbs: 2, fat: 4 },
        type: 'food',
        servingSize: 50,
        numberOfServings: 3,
      },
      {
        _id: '567e89',
        searchId: '56789',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYh_GM0PimdSFWCXk0jE-GWGRYGXmno2muj__ddRNSy9gp87R9IMwDY_kWWRbdvrO0Zdc&usqp=CAU',
        name: 'Item 5',
        macros: { calories: 62, protein: 5, carbs: 2, fat: 4 },
        type: 'food',
        servingSize: 50,
        numberOfServings: 3,
      },
      {
        _id: '6789s0',
        searchId: '67890',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYh_GM0PimdSFWCXk0jE-GWGRYGXmno2muj__ddRNSy9gp87R9IMwDY_kWWRbdvrO0Zdc&usqp=CAU',
        name: 'Item 6',
        macros: { calories: 62, protein: 5, carbs: 2, fat: 4 },
        type: 'food',
        servingSize: 50,
        numberOfServings: 3,
      },
      {
        _id: '678wf90',
        searchId: '67890',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYh_GM0PimdSFWCXk0jE-GWGRYGXmno2muj__ddRNSy9gp87R9IMwDY_kWWRbdvrO0Zdc&usqp=CAU',
        name: 'Item 6',
        macros: { calories: 62, protein: 5, carbs: 2, fat: 4 },
        type: 'food',
        servingSize: 50,
        numberOfServings: 3,
      },
    ],
  })
  const [stage, setStage] = useState<string>(stages[0])
  const [direction, setDirection] = useState(1)

  const [isItemSelected, setIsItemSelected] = useState<boolean>(false)

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

  const onSaveMeal = () => {
    console.log('editMeal', editMeal)
    // mealService.save(editMeal)
  }

  useEffect(() => {
    // console.log('editMeal', editMeal)
  }, [editMeal])

  const onChangeStage = (diff: number) => {
    if (_getDisabledNavButton(diff > 0 ? 'next' : 'previous')) return
    const next = stages.indexOf(stage) + diff
    setDirection(diff > 0 ? 1 : -1)
    setStage(stages[next])
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
          <Lottie animationData={foodAnimation} loop={false} />
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
            <CustomButton text='Add Item' fullWidth />
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
              // renderSecondaryText={(item) =>
              //   `${+item.servingSize * +item.numberOfServings}gr - ${
              //     item.macros?.calories
              //   } kcal`
              // }
              // renderRight={(item) => <div>{item.name}</div>}
            />
          </div>
          <SlideDialog
            open={isItemSelected}
            onClose={onCloseItemDetails}
            component={<ItemDetails onAddToMealClick={onAddToMealClick} />}
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
          <CustomButton
            text='Next'
            onClick={() => onChangeStage(1)}
            fullWidth
            disabled={_getDisabledNavButton('next')}
          />
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
    setIsItemSelected(true)
    setItem(item)
  }

  function onCloseItemDetails() {
    setIsItemSelected(false)
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

    const newMacros = {
      calories: newItems.reduce((acc, item) => acc + item.macros.calories, 0),
      protein: newItems.reduce((acc, item) => acc + item.macros.protein, 0),
      carbs: newItems.reduce((acc, item) => acc + item.macros.carbs, 0),
      fat: newItems.reduce((acc, item) => acc + item.macros.fat, 0),
    }

    setEditMeal({ ...editMeal, items: newItems, macros: newMacros })
    setIsItemSelected(false)
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

      console.log('stage', stage)
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
      {/* <CustomButton text='Save' onClick={onSaveMeal} fullWidth /> */}

      {renderNavigationFooter()}
    </div>
  )
}
