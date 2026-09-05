import { useEffect, useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { Item } from '../../types/item/Item'

import { Macros } from '../Macros/Macros'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import {
  generateBooleanOptionsTranslated,
  getArrayOfNumbers,
  getCurrMeal,
  getNextFromBoolean,
} from '../../services/util.service'
import { searchService } from '../../services/search/search-service'
import Typography from '@mui/material/Typography'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { logService } from '../../services/log/log.service'
import { MealItem } from '../../types/mealItem/MealItem'
import { Meal } from '../../types/meal/Meal'
import { Log } from '../../types/log/Log'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { User } from '../../types/user/User'

import { Macros as MacrosType } from '../../types/macros/Macros'
import { EditItem } from '../../types/editItem/editItem'
import { searchTypes } from '../../assets/config/search-types'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomFloatingButton } from '../../CustomMui/CustomFloatingButton/CustomFloatingButton'
import { EditMacros } from '../MacrosProgress/EditMacros'
import { calculateProteinCalories } from '../../services/macros/macros.service'
import { calculateCarbCalories } from '../../services/macros/macros.service'
import { calculateFatCalories } from '../../services/macros/macros.service'
import EditIcon from '@mui/icons-material/Edit'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import {
  handleFavorite,
  optimisticUpdateUser,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { dayService } from '../../services/day/day.service'

import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { imageService } from '../../services/image/image.service'
import { uploadService } from '../../services/upload.service'
import {
  loadItems,
  setSelectedMeal,
  setEditMealItem,
} from '../../store/actions/item.actions'
import { ClockPicker } from '../Pickers/ClockPicker'
import { PickerSelect } from '../Pickers/PickerSelect'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { Menu } from '../../types/menu/Menu'
import { getItemDetailsDayProgressPreview } from '../../services/macros/day-progress-preview.service'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import { itemNameService } from '../../services/item/item-name.service'
import { isBarcodeSearchId } from '../../services/item/item-id.service'
import { ItemCategoryBadges } from '../ItemCategoryBadge/ItemCategoryBadge'
import {
  isItemCategoryId,
  type ItemCategoryId,
} from '../../assets/config/item-categories'
import {
  itemDetailsPrefsService,
  type ItemMacrosView,
} from '../../services/item/item-details-prefs.service'
import { itemDetailsNs } from './locals'
import AutorenewIcon from '@mui/icons-material/Autorenew'
// import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { searchUrls } from '../../assets/config/search.urls'
import MealImage from '../../../public/meal-upload.png'
import { itemService } from '../../services/item/item.service'
import { ItemName } from '../../types/item/LocalizedName'
interface ItemDetailsProps {
  onAddToMealClick?: (item: MealItem, shouldCreateItem: boolean) => void
  noEdit?: boolean
  isCustomLog?: boolean
  updateMenu?: (newMenu: Menu) => void
  editMenu?: Menu
  shouldDefaultItemMacros?: boolean
}

interface EditOption {
  label: string
  key: string
  values?: string[] | number[]
  type?: string
  extra?: string
}

const MEAL_VALUES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

const getMealInput = (t: (key: string) => string) => ({
  label: t('meals.meal'),
  key: 'meal',
  values: MEAL_VALUES,
  type: 'select',
  extra: '',
})

const getNumberOfServingsInput = (t: (key: string) => string) => ({
  label: t('meals.numberOfServings'),
  key: 'numberOfServings',
  values: getArrayOfNumbers(0, 100),
  type: 'clock',
  extra: '',
})

// const MACROS_VIEW_VALUES: ItemMacrosView[] = ['per100g', 'dayProgress']

function getItemCategories(
  item: Item | Meal | Log | null | undefined
): ItemCategoryId[] {
  if (!item) return []
  const raw = (item as Item).categories || (item as Log).categories || []
  return raw.filter(isItemCategoryId)
}

export function ItemDetails({
  onAddToMealClick,
  noEdit = false,
  isCustomLog = false,
  updateMenu,
  editMenu,
  shouldDefaultItemMacros = false,
}: ItemDetailsProps) {
  const { t, i18n } = useTranslation()
  const { t: tDetails } = useTranslation(itemDetailsNs)
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

  const item: Item | Meal | Log = useMemo(
    () => (editMealItem ? editMealItem : searchedItem),
    [editMealItem, searchedItem]
  )

  const stringifiedItem = useMemo(() => {
    return JSON.stringify(item)
  }, [item])

  const isMeal = _hasItems(item)

  const isCustom =
    isCustomLog ||
    (item as Log).source === searchTypes.custom ||
    (item as Item).type === searchTypes.custom

  const canEditCustomChrome =
    isCustom &&
    !noEdit &&
    (!(item as Log).createdBy || (item as Log).createdBy === user?._id)

  const [editItem, setEditItem] = useState<EditItem>({
    totalMacros: isCustomLog ? _getDefaultMacros() : item.macros,
    servingSize: editMealItem?.servingSize || 100,
    numberOfServings: editMealItem?.numberOfServings || 1,
    meal: editMealItem?.meal || selectedMeal || getCurrMeal(),
    name: isCustomLog
      ? ''
      : itemNameService.getItemDisplayName(
          editMealItem?.name || searchedItem.name,
          i18n.language
        ),
  })

  const [clockOpen, setClockOpen] = useState(false)
  const [macrosOpen, setMacrosOpen] = useState(false)

  // const[nestedItemToEdit, setNestedItemToEdit] = useState<MealItem | null>(null)

  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [macrosView, setMacrosView] = useState<ItemMacrosView>(
    shouldDefaultItemMacros ? 'per100g' : 'dayProgress'
  )
  const [customImage, setCustomImage] = useState(item?.image)
  const [customCategories, setCustomCategories] = useState<ItemCategoryId[]>(
    () => getItemCategories(item)
  )
  const [shouldCreateItem, setShouldCreateItem] = useState(
    canEditCustomChrome && !editMealItem
  )
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const mealValueLabels = useMemo(
    () => ({
      Breakfast: t('meals.breakfast'),
      Lunch: t('meals.lunch'),
      Dinner: t('meals.dinner'),
      Snacks: t('meals.snacks'),
    }),
    [t]
  )

  const canShowDayProgress = !!(
    !noEdit &&
    user &&
    selectedDay &&
    user.currGoal?.macros &&
    user.currGoal?.dailyCalories
  )

  const dayProgressPreview = useMemo(() => {
    if (!canShowDayProgress || !selectedDay || !user?.currGoal) return null

    return getItemDetailsDayProgressPreview({
      selectedDay,
      goals: {
        calories: user.currGoal.dailyCalories,
        protein: user.currGoal.macros.protein,
        carbs: user.currGoal.macros.carbs,
        fat: user.currGoal.macros.fat,
      },
      editedMacros: editItem.totalMacros,
      originalMacros: editMealItem?.macros ?? null,
    })
  }, [
    canShowDayProgress,
    selectedDay,
    user?.currGoal,
    editItem.totalMacros,
    editMealItem?.macros,
  ])

  useEffect(() => {
    let cancelled = false

    itemDetailsPrefsService.getMacrosView().then((savedView) => {
      if (cancelled) return
      if (shouldDefaultItemMacros) {
        setMacrosView('per100g')
        return
      }
      setMacrosView(savedView)
    })

    return () => {
      cancelled = true
    }
  }, [shouldDefaultItemMacros, stringifiedItem])

  const editOptions: EditOption[] =
    !isCustomLog && (item as Log).source !== searchTypes.custom
      ? [
          {
            label: t('meals.servingSize'),
            key: 'servingSize',
            values: [1, 25, 30, 50, 100, 150],
            extra: t('macros.gram'),
            type: 'select',
          },
          getNumberOfServingsInput(t),
          getMealInput(t),
        ]
      : [
          {
            label: t('macros.macros'),
            key: 'custom-log-macros',

            type: 'macros',
            extra: '',
            values: [],
          },
          getNumberOfServingsInput(t),
          getMealInput(t),
        ]

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    setEditItem({
      totalMacros: isCustomLog ? _getDefaultMacros() : item.macros,
      servingSize: editMealItem?.servingSize || 100,
      numberOfServings: editMealItem?.numberOfServings || 1,
      meal: editMealItem?.meal || selectedMeal || getCurrMeal(),
      name: isCustomLog
        ? ''
        : itemNameService.getItemDisplayName(
            editMealItem?.name || searchedItem.name,
            i18n.language
          ),
    })
    setCustomImage(item?.image)
    setCustomCategories(getItemCategories(item))
  }, [stringifiedItem, isCustomLog])
  const closeClock = () => {
    setClockOpen(false)
  }
  const openClock = () => {
    setClockOpen(true)
  }

  const closeMacros = () => {
    setMacrosOpen(false)
  }
  const openMacros = () => {
    setMacrosOpen(true)
  }

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const onEditItemChange = (key: string, value: string | number) => {
    let totalMacrosToSet = searchedItem.macros

    let caloriesBaseline = searchedItem.macros.calories
    let proteinBaseline = searchedItem.macros.protein
    let carbsBaseline = searchedItem.macros.carbs
    let fatBaseline = searchedItem.macros.fat

    if (isCustomLog || searchedItem.type === searchTypes.custom) {
      const normalizedMacros = {
        calories:
          (editItem.totalMacros.calories * editItem.servingSize) /
          100 /
          editItem.numberOfServings,
        protein:
          (editItem.totalMacros.protein * editItem.servingSize) /
          100 /
          editItem.numberOfServings,
        carbs:
          (editItem.totalMacros.carbs * editItem.servingSize) /
          100 /
          editItem.numberOfServings,
        fat:
          (editItem.totalMacros.fat * editItem.servingSize) /
          100 /
          editItem.numberOfServings,
      }

      caloriesBaseline = normalizedMacros.calories
      proteinBaseline = normalizedMacros.protein
      carbsBaseline = normalizedMacros.carbs
      fatBaseline = normalizedMacros.fat
    }

    switch (key) {
      case 'servingSize':
        totalMacrosToSet = {
          calories: Math.round(
            (+value / 100) * caloriesBaseline * editItem.numberOfServings
          ),
          protein: Math.round(
            (+value / 100) * proteinBaseline * editItem.numberOfServings
          ),
          carbs: Math.round(
            (+value / 100) * carbsBaseline * editItem.numberOfServings
          ),
          fat: Math.round(
            (+value / 100) * fatBaseline * editItem.numberOfServings
          ),
        }

        break

      case 'numberOfServings':
        totalMacrosToSet = {
          calories: Math.round(
            (+value * caloriesBaseline * editItem.servingSize) / 100
          ),
          protein: Math.round(
            (+value * proteinBaseline * editItem.servingSize) / 100
          ),
          carbs: Math.round(
            (+value * carbsBaseline * editItem.servingSize) / 100
          ),
          fat: Math.round((+value * fatBaseline * editItem.servingSize) / 100),
        }
        break

      case 'meal':
        setEditItem((prev) => ({
          ...prev,
          [key]: value as string,
        }))
        return

      case 'name':
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

  const onFavoriteClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      e.stopPropagation()

      if (!user) return showErrorMsg(t('messages.error.favorite'))
      if (!searchedItem.searchId)
        return showErrorMsg(t('messages.error.favorite'))

      await handleFavorite(searchedItem, user)
    } catch {
      showErrorMsg(t('messages.error.favorite'))
    }
  }

  function _getDefaultMacros() {
    const protein = 15
    const carbs = 20
    const fats = 5
    const calories =
      calculateProteinCalories(protein) +
      calculateCarbCalories(carbs) +
      calculateFatCalories(fats)
    return {
      calories,
      protein,
      carbs,
      fat: fats,
    }
  }

  function _hasItems(
    x: Item | Meal | Log | null | undefined
  ): x is Meal | (Item & { items: MealItem[] }) {
    if (!x) return false
    return (
      Array.isArray((x as Item & { items: MealItem[] }).items) &&
      (x as Item & { items: MealItem[] }).items.length > 0
    )
  }

  const onAddToMeal = async () => {
    try {
      if (!user) return showErrorMsg(t('messages.error.addLog'))

      if (!selectedDay) return showErrorMsg(t('messages.error.addLog'))

      if (shouldCreateItem) {
        try {
          await itemService.create({
            name: { default: editItem.name || '' } as ItemName,
            macros: editItem.totalMacros,
            image: customImage,
            categories: customCategories,
            createdBy: user._id,
            type: 'custom',
          })
        } catch {}
      }

      if (!isCustomLog && !item.searchId && _hasItems(item)) {
        const mealNumberOfServings = editItem.numberOfServings

        const logsToAdd = item.items
          .map((item: MealItem) => {
            let source = ''

            if (!item.searchId) {
              source = searchTypes.meal
            } else {
              source =
                isCustomLog || item.source === searchTypes.custom
                  ? searchTypes.custom
                  : isBarcodeSearchId(item.searchId)
                  ? searchTypes.openFoodFacts
                  : searchTypes.usda
            }

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
              source,
              mealId: item.mealId || undefined,
              createdBy: user._id,
              name:
                isCustomLog || item.source === searchTypes.custom || item.mealId
                  ? itemNameService.getItemDisplayName(item.name, i18n.language)
                  : '',
            }
          })
          .filter((log) => log !== null)

        if (!logsToAdd.length) return showErrorMsg(t('messages.error.addLog'))

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

        setEditMealItem(null)
        showSuccessMsg(t('messages.success.addedToMeal'))
        return
      }

      const itemToCache = {
        ...searchedItem,
      }
      delete itemToCache._id

      const newLog = {
        itemId: isCustomLog ? '' : item.searchId,
        meal: editItem.meal,
        macros: editItem.totalMacros,
        time: Date.now(),
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,
        source: isCustomLog ? searchTypes.custom : searchedItem.type,
        createdBy: user._id,
        name: isCustomLog ? editItem.name : '',
        image: isCustom ? customImage : undefined,
        categories: isCustom ? customCategories : undefined,
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

      setEditMealItem(null)
      showSuccessMsg(t('messages.success.addedToMeal'))
    } catch {
      showErrorMsg(t('messages.error.addLog'))
    }
  }

  async function onEditMeal() {
    try {
      if (!editMealItem) return showErrorMsg(t('messages.error.editMeal'))

      const newLog = {
        ...editMealItem,
        macros: editItem.totalMacros,
        meal: editItem.meal,
        servingSize: editItem.servingSize,
        numberOfServings: editItem.numberOfServings,

        name:
          isCustomLog || (item as Log).source === searchTypes.custom
            ? editItem.name
            : itemNameService.getItemDisplayName(
                editMealItem.name,
                i18n.language
              ),
      }

      delete newLog.searchId

      if (isCustom) {
        newLog.image = customImage
        newLog.categories = customCategories
      } else {
        delete newLog.image
      }

      if (!isCustomLog && (item as Log).source !== searchTypes.custom)
        delete newLog.name

      const userLogs = selectedDay?.logs

      if (!userLogs) return showErrorMsg(t('messages.error.editMeal'))
      const logIndex = userLogs.findIndex(
        (log) =>
          log.time === editMealItem.time && log.itemId === editMealItem.itemId
      )
      if (logIndex === -1) return showErrorMsg(t('messages.error.editMeal'))

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

      showSuccessMsg(t('messages.success.saveMeal'))
    } catch {
      showErrorMsg(t('messages.error.saveMeal'))
      optimisticUpdateUser(user as User)
    }
  }

  const getOnClick = () => {
    if (onAddToMealClick) {
      return () => {
        const itemMealToEdit = {
          searchId: isCustomLog ? '' : item.searchId,
          name: isCustomLog
            ? editItem.name
            : itemNameService.getItemDisplayName(item.name, i18n.language) ||
              editItem.name,
          macros: editItem.totalMacros,
          image: isCustom ? customImage : item.image,
          servingSize: editItem.servingSize,
          numberOfServings: editItem.numberOfServings,
          source: isCustomLog ? searchTypes.custom : null,
          categories: isCustom ? customCategories : getItemCategories(item),
        }

        if (!isCustomLog && (item as Item).type === 'meal') {
          ;(itemMealToEdit as MealItem).mealId = item._id
          ;(itemMealToEdit as MealItem).source = 'meal'
        }

        if ((item as Item).type && !isCustomLog) {
          itemMealToEdit.source = (item as Item).type
        }

        onAddToMealClick(itemMealToEdit as MealItem, shouldCreateItem)
      }
    }
    if (updateMenu) {
      return async () => {
        const itemIndex = editMenu?.menuLogs.findIndex(
          (log) => log._id === item._id
        )

        if (itemIndex === -1 || (!itemIndex && itemIndex !== 0)) return

        const newLog = {
          ...editMenu?.menuLogs[itemIndex],
          meal: editItem.meal,
          macros: editItem.totalMacros,
          numberOfServings: editItem.numberOfServings,
          source: isCustomLog ? searchTypes.custom : null,
          isFixedMenuLog: true,
          name: editItem.name || t('menu.customItem'),
          image: isCustom ? customImage : editMenu?.menuLogs[itemIndex]?.image,
          categories: isCustom
            ? customCategories
            : editMenu?.menuLogs[itemIndex]?.categories,
        }

        editMenu?.menuLogs.splice(itemIndex, 1, newLog as Log)
        const newLogs = [...(editMenu?.menuLogs || [])]
        const newMenu = {
          ...editMenu,
          menuLogs: newLogs,
        }

        try {
          await logService.save(newLog as Log)

          updateMenu(newMenu as Menu)

          showSuccessMsg(t('messages.success.saveMeal'))
          return
        } catch {
          showErrorMsg(t('messages.error.saveMeal'))
        }
      }
    }
    if (editMealItem) {
      return onEditMeal
    }

    return onAddToMeal
  }

  const onEditCustomLog = (macros: MacrosType) => {
    setEditItem((prev) => ({
      ...prev,
      totalMacros: macros,
    }))
  }

  const renderErrorImage = () => {
    if (editMealItem) {
      setEditMealItem({ ...editMealItem, image: undefined })
    }
    if (searchedItem) searchedItem.image = undefined
  }

  const displayImage = isCustom ? customImage : item?.image
  const displayCategories = isCustom
    ? customCategories
    : getItemCategories(item)
  const per100gMacros = useMemo(() => {
    return isCustom
      ? editItem.totalMacros
      : item?.macros || editItem.totalMacros
  }, [item?.macros, editItem.totalMacros, isCustom])

  const onMacrosViewChange = (value: string) => {
    const next = value === 'per100g' ? 'per100g' : 'dayProgress'
    setMacrosView(next)
    itemDetailsPrefsService.setMacrosView(next)
  }

  const onPickCustomImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!event.target.files?.length) return
      setIsUploadingImage(true)
      const res = await uploadService.uploadImg(event)
      if (res?.secure_url) setCustomImage(res.secure_url)
    } catch {
      showErrorMsg(t('messages.error.uploadImg'))
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  function getPer100gDonutProps() {
    return {
      protein: per100gMacros?.protein,
      carbs: per100gMacros?.carbs,
      fats: per100gMacros?.fat,
      calories: per100gMacros?.calories,
    }
  }

  function getLogDonutProps() {
    const macros = editItem.totalMacros
    return {
      protein: macros?.protein,
      carbs: macros?.carbs,
      fats: macros?.fat,
      calories: macros?.calories,
    }
  }

  function getDayProgressDonutProps() {
    if (!dayProgressPreview) return getLogDonutProps()

    const { ring, baseline, goals, projected, fillDenom, calorieDelta } =
      dayProgressPreview
    const pending = dayProgressPreview.hasPendingChange

    return {
      protein: ring.protein,
      carbs: ring.carbs,
      fats: ring.fat,
      showProgress: true,
      currentProtein: baseline.protein,
      currentCarbs: baseline.carbs,
      currentFats: baseline.fat,
      currentCalories: baseline.calories,
      goalCalories: goals.calories,
      previewProtein: pending ? projected.protein : undefined,
      previewCarbs: pending ? projected.carbs : undefined,
      previewFats: pending ? projected.fat : undefined,
      fillDenomProtein: fillDenom.protein,
      fillDenomCarbs: fillDenom.carbs,
      fillDenomFats: fillDenom.fat,
      calorieDelta: pending ? calorieDelta : undefined,
    }
  }

  function getPrimaryDonutProps() {
    if (!canShowDayProgress) return getLogDonutProps()
    if (macrosView === 'per100g') return getPer100gDonutProps()
    return getDayProgressDonutProps()
  }

  function getSecondaryDonutProps() {
    if (!canShowDayProgress) return getPer100gDonutProps()
    if (macrosView === 'per100g') return getDayProgressDonutProps()
    return getPer100gDonutProps()
  }

  const primaryLabel = !canShowDayProgress
    ? tDetails('thisLog')
    : macrosView === 'per100g'
    ? tDetails('per100g')
    : tDetails('dayProgress')

  const secondaryLabel = !canShowDayProgress
    ? tDetails('per100g')
    : macrosView === 'per100g'
    ? tDetails('dayProgress')
    : tDetails('per100g')

  const logGrams = {
    protein: editItem.totalMacros?.protein || 0,
    carbs: editItem.totalMacros?.carbs || 0,
    fats: editItem.totalMacros?.fat || 0,
  }

  const heroName = itemNameService.getItemDisplayName(item?.name, i18n.language)
  const baselineKcal = Math.round(per100gMacros?.calories || 0)

  const renderEditOptions = (compact: boolean) =>
    !noEdit &&
    editOptions.map((option) => {
      if (onAddToMealClick && option.key === 'meal') return null

      if (
        (!item.searchId && _hasItems(item) && option.key === 'servingSize') ||
        ((item as Item).type === 'meal' && option.key === 'servingSize') ||
        ((item as MealItem).mealId && option.key === 'servingSize') ||
        (!updateMenu &&
          (item as Log).isFixedMenuLog &&
          option.key === 'servingSize') ||
        (!updateMenu &&
          (item as Log).isFixedMenuLog &&
          option.key === 'numberOfServings') ||
        (!updateMenu && (item as Log).isFixedMenuLog && option.key === 'meal')
      )
        return null

      return (
        <div
          className={`select-container ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${option.label.toLowerCase().split(' ').join('-')} ${
            !isMeal && !isCustom ? 'with-serving-size' : ''
          }`}
          key={option.label}
        >
          {!compact && <Typography variant='h6'>{option.label}</Typography>}
          {option.type === 'select' && option.values && (
            <CustomSelect
              tooltipTitle={t('common.editOption', {
                option: option.label,
              })}
              label={option.label}
              values={option.values.map((value) => value.toString())}
              valueLabels={option.key === 'meal' ? mealValueLabels : undefined}
              extra={option.extra}
              value={editItem[option.key as keyof EditItem]?.toString() || ''}
              onChange={(value) => onEditItemChange(option.key, value)}
              className={`${prefs.favoriteColor}`}
            />
          )}
          {option.type === 'clock' && (
            <>
              <PickerSelect
                className={`${prefs.favoriteColor} picker-select ${
                  prefs.isDarkMode ? 'dark-mode' : ''
                }`}
                openClock={openClock}
                option={option}
                value={editItem.numberOfServings}
              />
              <SlideDialog
                open={clockOpen}
                onClose={closeClock}
                component={
                  <ClockPicker
                    value={editItem.numberOfServings}
                    onChange={onEditItemChange}
                    onClose={closeClock}
                  />
                }
                title={option.label}
              />
            </>
          )}
          {option.type === 'macros' && (
            <>
              <CustomButton
                text={t('macros.editMacrosButton')}
                onClick={openMacros}
                icon={<EditIcon />}
                className='edit-macros-button'
              />
              <SlideDialog
                open={macrosOpen}
                onClose={closeMacros}
                component={
                  <EditMacros
                    isCustomLog={
                      isCustomLog || (item as Log).source === searchTypes.custom
                    }
                    protein={editItem.totalMacros?.protein || 0}
                    carbs={editItem.totalMacros?.carbs || 0}
                    fats={editItem.totalMacros?.fat || 0}
                    editCustomLog={onEditCustomLog}
                    onCancel={closeMacros}
                    onSave={closeMacros}
                  />
                }
              />
            </>
          )}
        </div>
      )
    })

  return (
    <>
      <div
        className={`item-details ${noEdit ? 'no-edit' : ''} ${
          isCustom ? 'custom-log' : ''
        }`}
      >
        <div className='hero'>
          <div
            className='hero-image box-shadow white-outline'
            onClick={displayImage ? openImageModal : undefined}
          >
            {(displayImage && (
              <img
                src={displayImage}
                alt={heroName}
                referrerPolicy='no-referrer'
                onError={async (e) => {
                  if (isCustom) {
                    setCustomImage(undefined)
                    return
                  }
                  renderErrorImage()
                  await imageService.fetchOnError(e, item as Item)
                  loadItems()
                }}
              />
            )) ||
              (!canEditCustomChrome ? (
                <CustomSkeleton
                  variant='rectangular'
                  width='100%'
                  height='100%'
                  isDarkMode={prefs.isDarkMode}
                />
              ) : (
                <div
                  className='edit-custom-log-img-placeholder'
                  onClick={(event) => {
                    event.stopPropagation()
                    imageInputRef.current?.click()
                  }}
                >
                  <Typography variant='body1'>
                    {t('customLog.uploadImage')}
                  </Typography>
                  <img
                    src={MealImage}
                    alt='Meal image'
                    className='edit-custom-log-img-placeholder-img'
                  />
                </div>
              ))}
            {!noEdit && !isCustom && !_hasItems(item) && (
              <div
                className='favorite-on-media'
                onClick={onFavoriteClick}
              >
                <FavoriteButton
                  isFavorite={
                    searchService.isFavorite(searchedItem, user) || false
                  }
                  isDarkMode={prefs.isDarkMode}
                />
              </div>
            )}
            {canEditCustomChrome && (
              <>
                <button
                  type='button'
                  className='hero-edit-photo'
                  onClick={(event) => {
                    event.stopPropagation()
                    imageInputRef.current?.click()
                  }}
                  aria-label={tDetails('uploadImage')}
                  disabled={isUploadingImage}
                >
                  <PhotoCameraIcon fontSize='small' />
                </button>
                <input
                  ref={imageInputRef}
                  type='file'
                  accept='image/*'
                  hidden
                  onChange={onPickCustomImage}
                />
              </>
            )}
          </div>
          <div className='macros-primary'>
            <MacrosDonut
              size={148}
              {...getPrimaryDonutProps()}
            />
            <span className='macros-label'>{primaryLabel}</span>
            <div className='switch-button-container'>
              <CustomButton
                onClick={() =>
                  onMacrosViewChange(
                    macrosView === 'per100g' ? 'dayProgress' : 'per100g'
                  )
                }
                icon={<AutorenewIcon />}
                isIcon={true}
                size='small'
                className={`switch-button ${prefs.favoriteColor} ${
                  prefs.isDarkMode ? 'dark-mode' : ''
                }`}
              />
            </div>
          </div>
          {/* <div className='hero-copy'>
            {isCustom ? (
              <CustomInput
                value={editItem.name || ''}
                onChange={(value) => onEditItemChange('name', value)}
                placeholder={t('common.name')}
                className={`${prefs.favoriteColor}`}
              />
            ) : (
              <>
                <MarqueeText
                  variant='body1'
                  className='title'
                >
                  {heroName || ''}
                </MarqueeText>
                <div className='subtitle'>
                  {`${baselineKcal} ${t('macros.kcal')} ${t('meals.for')} ${
                    !_hasItems(item)
                      ? t('meals.per100g')
                      : t('meals.perServing')
                  }`}
                </div>
                <ItemCategoryBadges
                  categories={displayCategories}
                  size='s'
                  editable={canEditCustomChrome}
                  onChange={setCustomCategories}
                />
              </>
            )}
          </div> */}
        </div>
        <div className='content'>
          {/* <div className='macros-toolbar'>
            {canShowDayProgress && (
              <CustomSelect
                tooltipTitle={tDetails('viewBy')}
                label={tDetails('viewBy')}
                values={MACROS_VIEW_VALUES}
                value={macrosView}
                valueLabels={{
                  per100g: tDetails('per100g'),
                  dayProgress: tDetails('dayProgress'),
                }}
                onChange={onMacrosViewChange}
                className={`${prefs.favoriteColor}`}
              />
            )}
          </div> */}

          <div className={`hero-copy ${canEditCustomChrome ? 'editing' : ''}`}>
            {canEditCustomChrome ? (
              <div className='title-editing-container'>
                <CustomInput
                  value={editItem.name || ''}
                  onChange={(value) => onEditItemChange('name', value)}
                  placeholder={t('common.name')}
                  className={`${prefs.favoriteColor}`}
                />
                {!editMealItem && (
                  <CustomSelect
                    label={t('customLog.createNewItem')}
                    values={generateBooleanOptionsTranslated(i18n.language).map(
                      (option) => option.label
                    )}
                    value={
                      generateBooleanOptionsTranslated(i18n.language).find(
                        (option) => option.value === shouldCreateItem
                      )?.label || ''
                    }
                    onChange={(value) => {
                      const next = getNextFromBoolean(i18n.language, value)
                      setShouldCreateItem(next)
                    }}
                    className={`${prefs.favoriteColor}`}
                  />
                )}
              </div>
            ) : (
              <>
                <MarqueeText
                  variant='body1'
                  className='title'
                >
                  {heroName || ''}
                </MarqueeText>
                <div className='subtitle'>
                  {`${baselineKcal} ${t('macros.kcal')} ${t('meals.for')} ${
                    !_hasItems(item)
                      ? t('meals.per100g')
                      : t('meals.perServing')
                  }`}
                </div>
              </>
            )}
            {canEditCustomChrome && (
              <div className='create-new-item-switch-container'>
                {/* <Typography variant='body1'>
                  {t('customLog.createNewItem')}
                </Typography>
                <CustomIOSSwitch checked /> */}
              </div>
            )}
            <ItemCategoryBadges
              categories={displayCategories}
              size='m'
              editable={canEditCustomChrome}
              onChange={setCustomCategories}
              className={`${prefs.favoriteColor} ${
                canEditCustomChrome ? 'editing' : ''
              }`}
            />
          </div>
        </div>
        {_hasItems(item) && (
          <div className='nested-items'>
            <Typography
              variant='h6'
              className='nested-items-title'
            >
              {tDetails('nestedItems')}
            </Typography>
            <ul className='nested-items-list'>
              {item.items.map((nested, index) => (
                <li
                  key={
                    nested.searchId || nested._id || `${nested.name}-${index}`
                  }
                >
                  <img
                    src={nested.image || searchUrls.DEFAULT_IMAGE}
                    alt={itemNameService.getItemDisplayName(
                      nested.name,
                      i18n.language
                    )}
                    referrerPolicy='no-referrer'
                    className='box-shadow white-outline nested-item-image'
                  />
                  <div className='text-container'>
                    <span className='nested-item-name'>
                      {itemNameService.getItemDisplayName(
                        nested.name,
                        i18n.language
                      )}
                    </span>
                    <span className='nested-item-kcal'>
                      {Math.round(nested.macros?.calories || 0)}{' '}
                      {t('macros.kcal')}
                    </span>
                  </div>
                  {/* <CustomButton
                    icon={<RemoveRedEyeIcon />}
                    isIcon={true}
                    size='small'
                    className={`${prefs.favoriteColor} ${
                      prefs.isDarkMode ? 'dark-mode' : ''
                    } nested-item-edit-button`}
                    onClick={() => {
                      console.log('edit nested item', nested)
                    }}
                  /> */}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className='macros-container'>
          <div className='macros-small'>
            <MacrosDonut
              size={108}
              {...getSecondaryDonutProps()}
            />
            <span className='macros-label'>{secondaryLabel}</span>
          </div>
          <Macros
            protein={logGrams.protein}
            carbs={logGrams.carbs}
            fats={logGrams.fats}
          />
        </div>{' '}
        {!!dayProgressPreview?.beyondWarningKey && (
          <div
            className={`beyond-macros-warning visible ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
          >
            <WarningAmberRoundedIcon
              className='beyond-macros-icon'
              fontSize='small'
            />
            <span>{t(`macros.${dayProgressPreview.beyondWarningKey}`)}</span>
          </div>
        )}
        {noEdit ? (
          <div className='edit'>
            <Macros
              protein={logGrams.protein}
              carbs={logGrams.carbs}
              fats={logGrams.fats}
            />
          </div>
        ) : (
          <div className='item-details-dock'>
            {renderEditOptions(true)}
            <CustomFloatingButton
              text={
                editMealItem ? tDetails('updateMeal') : tDetails('addToMeal')
              }
              icon={editMealItem ? <CheckIcon /> : <AddIcon />}
              size='medium'
              className={`item-details-fab ${prefs.favoriteColor}`}
              onClick={getOnClick()}
            />
          </div>
        )}
      </div>
      {displayImage && (
        <CustomAlertDialog
          open={isImageModalOpen}
          onClose={closeImageModal}
          title={heroName || ''}
        >
          <div className='modal-image-container'>
            <img
              src={displayImage}
              alt={heroName}
              className={`box-shadow white-outline`}
              referrerPolicy='no-referrer'
              onError={async (e) => {
                if (isCustom) {
                  setCustomImage(undefined)
                  return
                }
                await imageService.fetchOnError(e, item as Item)
                loadItems()
              }}
            />
          </div>
          <CustomButton
            text={t('common.cancel')}
            fullWidth
            onClick={closeImageModal}
            className={`${prefs.favoriteColor}`}
          />
        </CustomAlertDialog>
      )}
    </>
  )
}
