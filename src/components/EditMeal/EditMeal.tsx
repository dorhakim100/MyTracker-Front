import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Meal } from '../../types/meal/Meal'
import { mealService } from '../../services/meal/meal.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { RootState } from '../../store/store'

import Lottie from 'lottie-react'

import foodAnimation from '../../../public/food-animation.json'
import { CustomList } from '../../CustomMui/CustomList/CustomList'

import { MealItem } from '../../types/mealItem/MealItem'
import { setItem } from '../../store/actions/item.actions'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { MacrosDistribution } from '../MacrosDistribution/MacrosDistribution'
import { ItemSearch } from '../ItemSearch/ItemSearch'

import { CustomStepper } from '../../CustomMui/CustomStepper/CustomStepper'
import { capitalizeFirstLetter, makeId } from '../../services/util.service'
import { DeleteAction } from '../DeleteAction/DeleteAction'
import { searchUrls } from '../../assets/config/search.urls'
import { searchTypes } from '../../assets/config/search-types'

import SearchIcon from '@mui/icons-material/Search'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner'
import { itemService } from '../../services/item/item.service'

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
  const [modalType, setModalType] = useState<'search' | 'edit' | 'scan'>(
    'search'
  )

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

  const onScanItem = () => {
    setIsOpenModal(true)
    setModalType('scan')
  }

  const getModelType = () => {
    switch (modalType) {
      case 'search':
        return <ItemSearch onAddToMealClick={onAddToMealClick} />
      case 'edit':
        return <ItemDetails onAddToMealClick={onAddToMealClick} />
      case 'scan':
        return (
          <BarcodeScanner
            onClose={onCloseItemDetails}
            onAddToMealClick={onAddToMealClick}
          />
        )
      default:
        return <ItemSearch onAddToMealClick={onAddToMealClick} />
    }
  }

  const renderStageContent = () => {
    if (stage === 'name')
      return (
        <div className='stage-container'>
          <CustomInput
            value={editMeal.name}
            onChange={(value) => onEditMeal('name', value)}
            placeholder='Meal Name'
            className={`${prefs.favoriteColor}`}
          />
          <div className='animation-container'>
            <Lottie
              animationData={foodAnimation}
              loop={false}
            />
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
            <div className='buttons-container'>
              <CustomButton
                text='Search Item'
                fullWidth
                onClick={onAddItem}
                icon={<SearchIcon />}
              />
              <CustomButton
                text='Scan Item'
                fullWidth
                onClick={onScanItem}
                icon={<QrCode2Icon />}
              />
            </div>
            <CustomList
              className={`edit-meal-list ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
              items={editMeal.items}
              renderPrimaryText={(item) => {
                if (item.source === searchTypes.custom && !item.name)
                  return 'Custom Item'
                return item.name
              }}
              renderLeft={(item) => (
                <img
                  className='item-image'
                  src={item.image || searchUrls.DEFAULT_IMAGE}
                  alt={item.name}
                />
              )}
              renderSecondaryText={(item) => {
                if (item.source === searchTypes.custom)
                  return `${item.macros?.calories} kcal`
                return `${+item.servingSize * +item.numberOfServings}gr`
              }}
              getKey={(item) =>
                item._id || item.searchId || item.name || makeId()
              }
              isSwipeable={true}
              renderRightSwipeActions={(item) => (
                <DeleteAction
                  item={item}
                  onDeleteItem={onDeleteItem}
                />
              )}
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
            component={getModelType()}
            title='Item'
            type={modalType === 'scan' ? 'half' : 'full'}
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

  async function onAddToMealClick(item: MealItem) {
    try {
      const isImageNative = await itemService.isImageNative(item.searchId || '')
      if (!isImageNative) {
        item.image = undefined
      }
    } catch (err) {
      console.log('err', err)
    }

    const getNewItems = (item: MealItem) => {
      let newItems = []
      let hasIndex = -1
      if (item.searchId) {
        hasIndex = editMeal.items.findIndex((i) => i.searchId === item.searchId)
      } else {
        const normalizedItemMacros = {
          calories: item.macros.calories / item.numberOfServings,
          protein: item.macros.protein / item.numberOfServings,
          carbs: item.macros.carbs / item.numberOfServings,
          fat: item.macros.fat / item.numberOfServings,
        }
        hasIndex = editMeal.items.findIndex(
          (i) =>
            JSON.stringify({
              calories: i.macros.calories / i.numberOfServings,
              protein: i.macros.protein / i.numberOfServings,
              carbs: i.macros.carbs / i.numberOfServings,
              fat: i.macros.fat / i.numberOfServings,
            }) === JSON.stringify(normalizedItemMacros)
        )
        item.type = 'meal'
      }

      console.log('item', item)
      console.log('editMeal.items', editMeal.items)

      console.log('hasIndex', hasIndex)
      if (hasIndex !== -1) {
        newItems = [...editMeal.items]
        newItems[hasIndex] = item
      } else {
        if (item.searchId === '') {
          item.searchId = makeId()
          item.source = searchTypes.custom
        }
        newItems = [...editMeal.items, item]
      }

      return newItems
    }
    let newItems: MealItem[] = []
    if (item.items) {
      item.items.forEach((i) => {
        newItems.push(...getNewItems(i))
      })
    } else {
      newItems = getNewItems(item)
    }

    calcNewMealMacros(newItems)
    setIsOpenModal(false)
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

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'name':
        return 'Meal Name'
      case 'items':
        return editMeal.name
      default:
        return capitalizeFirstLetter(stage)
    }
  }

  const getIsNextDisabled = (stage: string) => {
    if (stage === 'name') return !editMeal.name
    if (stage === 'items') return !editMeal.items.length
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
        title={getStageTitle}
        getIsNextDisabled={getIsNextDisabled}
      />
    </div>
  )
}
