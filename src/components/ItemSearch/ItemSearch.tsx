import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

import { searchService } from '../../services/search/search-service'
import { searchTypes } from '../../assets/config/search-types'
import { messages } from '../../assets/config/messages'

import { RootState } from '../../store/store'
import {
  CustomToggle,
  ToggleOption,
} from '../../CustomMui/CustomToggle/CustomToggle'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { showErrorMsg } from '../../services/event-bus.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { Item } from '../../types/item/Item'
import { setItem, setSelectedMeal } from '../../store/actions/item.actions'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import {
  handleFavorite,
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { SearchFilter } from '../../types/searchFilter/SearchFilter'
import { Typography } from '@mui/material'
import { debounce } from '../../services/util.service'

import { User } from '../../types/user/User'
import { SkeletonList } from '../SkeletonList/SkeletonList'
import { MealItem } from '../../types/mealItem/MealItem'
import { itemService } from '../../services/item/item.service'

interface ItemSearchProps {
  onAddToMealClick?: (item: MealItem) => void
}

export function ItemSearch({ onAddToMealClick }: ItemSearchProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const user = useSelector((state: RootState) => state.userModule.user)

  const favoriteItems = useSelector(
    (state: RootState) => state.itemModule.favoriteItems
  )

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [resultsDragable, setResultsDragable] = useState(false)

  const [source, setSource] = useState(searchTypes.usda)

  const [isItemSelected, setIsItemSelected] = useState(false)

  // const isLoading = useSelector((state: RootState) => state.systemModule.isLoading)

  const toggleOptions: ToggleOption[] = [
    { value: searchTypes.meal, label: 'Meals' },
    { value: searchTypes.usda, label: 'Food' },
    { value: searchTypes.openFoodFacts, label: 'Product' },
  ]

  const handleSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!query) {
        const meals = user?.meals.map((meal) =>
          itemService.convertMealToItem(meal)
        )

        // console.log('meals', meals)
        console.log('favoriteItems', favoriteItems)
        const itemsToShow = favoriteItems.concat(meals || [])
        // setResults(favoriteItems)
        setResults(itemsToShow)
        setResultsDragable(true)
        return
      }

      if (!source) {
        showErrorMsg(messages.error.search)
        return
      }

      if (source === searchTypes.meal) {
        const regex = new RegExp(query, 'i')

        const meals = user?.meals
          .map((meal) => itemService.convertMealToItem(meal))
          .filter((meal) => regex.test(meal.name))

        setResults(meals || [])
        setResultsDragable(true)
        return
      }

      const searchQuery: SearchFilter = {
        txt: query,
        source: source as 'usda' | 'open-food-facts',
        // favoriteItems: user?.favoriteItems || { food: [], product: [] },
        favoriteItems: user?.favoriteItems,
      }

      const res = await searchService.search(searchQuery)

      setResultsDragable(false)
      setResults(res)
    } catch {
      showErrorMsg(messages.error.search)
    } finally {
      setIsLoading(false)
    }
  }, [query, source, user])

  const latestHandleSearchRef = useRef(handleSearch)
  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  useEffect(() => {
    debouncedRunSearch()
  }, [query, source, user, debouncedRunSearch])

  useEffect(() => {
    if (!query) {
      setResults(favoriteItems)
      setResultsDragable(true)
    }
  }, [query, favoriteItems])

  const onClearQuery = () => {
    setQuery('')
  }

  const onItemClick = (item: Item) => {
    setItem(item)
    setIsItemSelected(true)
  }

  const onFavoriteClick = async (item: Item) => {
    try {
      if (!user) return showErrorMsg(messages.error.favorite)
      if (!item.searchId) return showErrorMsg(messages.error.favorite)

      await handleFavorite(item, user)
    } catch {
      showErrorMsg(messages.error.favorite)
    }
  }

  const onCloseItemDetails = () => {
    setIsItemSelected(false)
    setSelectedMeal(null)
  }

  const dragEnd = async (newItems: Item[]) => {
    const newFavoriteItems = newItems.map((item) => item.searchId)

    const newUser = {
      ...user,
      favoriteItems: newFavoriteItems,
    }

    optimisticUpdateUser(newUser as User)
    try {
      await updateUser(newUser as User)
    } catch (err) {
      console.error(err)
      optimisticUpdateUser(user as User)
    }
  }

  const renderNoResults = () => {
    return (
      <Box className='results'>
        <Typography
          variant='h6'
          className={`no-results ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          No results...
        </Typography>
      </Box>
    )
  }

  const renderList = () => {
    const hasFavorite = user?.favoriteItems?.length !== 0

    if (!results.length && hasFavorite) {
      return <SkeletonList />
    } else if (!results.length && !hasFavorite) {
      return renderNoResults()
    }

    return (
      <Box className='results'>
        <CustomList<Item>
          items={results}
          getKey={(item) => item.searchId || item._id || ''}
          itemClassName={`search-item-container ${
            prefs.isDarkMode ? 'dark-mode' : ''
          }`}
          renderLeft={(item) => (
            <div className='left-content macros-image-container'>
              <MacrosDonut
                protein={item.macros?.protein}
                carbs={item.macros?.carbs}
                fats={item.macros?.fat}
              />
              <ListItemIcon className='item-image-container'>
                <img src={item.image} alt={item.name} className='item-image' />
              </ListItemIcon>
            </div>
          )}
          renderPrimaryText={(item) => item.name}
          renderSecondaryText={(item) => `${item.macros?.calories} kcal`}
          renderRight={(item) => (
            <FavoriteButton
              isFavorite={searchService.isFavorite(item, user) || false}
            />
          )}
          onItemClick={onItemClick}
          onRightClick={onFavoriteClick}
          isDragable={resultsDragable}
          onReorder={dragEnd}
        />
      </Box>
    )
  }

  return (
    <>
      <Box className={`item-search ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <Box className='search-container'>
          <CustomInput
            value={query}
            onChange={setQuery}
            placeholder='Search items...'
            startIconFn={() => <SearchIcon />}
            endIconFn={() => (
              <IconButton aria-label='close' onClick={onClearQuery}>
                <CloseIcon />
              </IconButton>
            )}
            autoFocus
          />
          <CustomToggle
            value={source}
            options={toggleOptions}
            onChange={setSource}
            className={`source-toggle ${prefs.isDarkMode ? 'dark-mode' : ''} ${
              prefs.favoriteColor
            }`}
            ariaLabel='data source'
          />
        </Box>

        {renderList()}
      </Box>

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
