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
import {
  loadItems,
  setItem,
  setSelectedMeal,
} from '../../store/actions/item.actions'
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
import { itemService } from '../../services/item/item.cache.service'

import DinnerDiningIcon from '@mui/icons-material/DinnerDining'

import Lottie from 'lottie-react'
import searchLight from '../../../public/searching.json'
import searchDark from '../../../public/searching-dark.json'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'

import { imageService } from '../../services/image/image.service'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'

interface ItemSearchProps {
  onAddToMealClick?: (item: MealItem) => void
}

export function ItemSearch({ onAddToMealClick }: ItemSearchProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const user = useSelector((state: RootState) => state.userModule.user)

  const favoriteItems = useSelector(
    (state: RootState) => state.itemModule.favoriteItems
  )

  const [results, setResults] = useState<Item[]>([])
  const [resultsDragable, setResultsDragable] = useState(false)

  // Keep a single filter object for both query and source
  type UiSearchSource = 'search' | 'meal'
  const [filter, setFilter] = useState<{ txt: string; source: UiSearchSource }>(
    { txt: '', source: searchTypes.search as UiSearchSource }
  )

  const [isItemSelected, setIsItemSelected] = useState(false)
  const [isCustomLog, setIsCustomLog] = useState(false)

  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )

  const toggleOptions: ToggleOption[] = [
    {
      value: searchTypes.search,
      label: 'Food',
      icon: <SearchIcon />,
    },
    { value: searchTypes.meal, label: 'My Meals', icon: <DinnerDiningIcon /> },
  ]

  const handleSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!filter.source) {
        showErrorMsg(messages.error.search)
        return
      }
      const regex = new RegExp(filter.txt, 'i')

      if (filter.source === searchTypes.meal) {
        const meals = user?.meals
          .map((meal) => itemService.convertMealToItem(meal))
          .filter((meal) => regex.test(meal.name))

        setResults(meals || [])
        setResultsDragable(false)
        setIsLoading(false)
        return
      }

      setResults(favoriteItems.filter((item) => regex.test(item.name)))

      if (!filter.txt) {
        setResultsDragable(true)
        setIsLoading(false)
        return
      }
      setResultsDragable(false)
      setIsLoading(true)

      const searchQuery: SearchFilter = {
        txt: filter.txt,
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
  }, [filter, user, favoriteItems])

  const latestHandleSearchRef = useRef(handleSearch)
  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  useEffect(() => {
    debouncedRunSearch()
  }, [filter, user, debouncedRunSearch])

  useEffect(() => {
    if (!filter.txt) {
      setResults(favoriteItems)
    }
  }, [filter.txt, favoriteItems])

  const onClearQuery = () => {
    setFilter((prev) => ({ ...prev, txt: '' }))
    setResults(favoriteItems)
    setResultsDragable(true)
  }

  const onItemClick = (item: Item) => {
    setItem(item)
    setIsItemSelected(true)
    setIsCustomLog(false)
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
    setIsCustomLog(false)
  }

  const onCustomLog = () => {
    setIsCustomLog(true)
    setIsItemSelected(true)
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
      <Box className="results">
        <Typography
          variant="h6"
          className={`no-results ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          No results...
        </Typography>
      </Box>
    )
  }

  const renderSearchFirst = () => {
    return (
      <Box className="results">
        <Lottie
          animationData={prefs.isDarkMode ? searchDark : searchLight}
          loop={true}
        />
        <Typography variant="h6" className="search-first">
          Search for an item first...
        </Typography>
      </Box>
    )
  }

  const renderList = () => {
    // const hasFavorite = user?.favoriteItems?.length !== 0

    if (!results.length && isLoading) {
      return <SkeletonList />
    } else if (!results.length && filter.txt) {
      // } else if (!results.length && !hasFavorite) {
      return renderNoResults()
    } else if (!results.length && !filter.txt) {
      return renderSearchFirst()
    }

    const renderErrorImage = (item: Item) => {
      item.image = undefined
      const newResults = results.map((i) =>
        i.searchId === item.searchId ? { ...i, image: undefined } : i
      )
      setResults(newResults)
    }

    return (
      <Box className="results">
        <CustomList<Item>
          items={results}
          getKey={(item) => item.searchId || item._id || ''}
          itemClassName={`search-item-container ${
            prefs.isDarkMode ? 'dark-mode' : ''
          }`}
          renderLeft={(item) => (
            <div className="left-content macros-image-container">
              <MacrosDonut
                protein={item.macros?.protein}
                carbs={item.macros?.carbs}
                fats={item.macros?.fat}
              />
              <ListItemIcon className="item-image-container">
                {(item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-image"
                    referrerPolicy="no-referrer"
                    onError={async (e) => {
                      renderErrorImage(item)
                      await imageService.fetchOnError(e, item)
                      loadItems()
                    }}
                  />
                )) || (
                  <CustomSkeleton
                    variant="circular"
                    width={40}
                    height={40}
                    isDarkMode={prefs.isDarkMode}
                  />
                )}
              </ListItemIcon>
            </div>
          )}
          renderPrimaryText={(item) => (
            <div className="hide-text-overflow">{item.name}</div>
          )}
          renderSecondaryText={(item) => {
            let caloriesToDisplay
            const itemCalories = item.macros.calories

            if (itemCalories) {
              caloriesToDisplay = +itemCalories
              caloriesToDisplay = caloriesToDisplay.toFixed(0)
            }

            return `${caloriesToDisplay || 0} kcal`
          }}
          renderRight={(item) =>
            item.type !== 'meal' && (
              <FavoriteButton
                isFavorite={searchService.isFavorite(item, user) || false}
              />
            )
          }
          onItemClick={onItemClick}
          onRightClick={onFavoriteClick}
          isDragable={resultsDragable}
          onReorder={dragEnd}
        />
        {isLoading && <SkeletonList />}
      </Box>
    )
  }

  return (
    <>
      <Box className={`item-search ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <Box className="search-container">
          <div className="input-container">
            <CustomInput
              value={filter.txt}
              onChange={(val) => setFilter((prev) => ({ ...prev, txt: val }))}
              placeholder="Search items..."
              startIconFn={() => <SearchIcon />}
              endIconFn={() => (
                <IconButton aria-label="close" onClick={onClearQuery}>
                  <CloseIcon />
                </IconButton>
              )}
              autoFocus
              className={`${prefs.favoriteColor}`}
            />
          </div>
          <CustomToggle
            value={filter.source}
            options={toggleOptions}
            onChange={(val) =>
              setFilter((prev) => ({ ...prev, source: val as UiSearchSource }))
            }
            className={`source-toggle ${prefs.isDarkMode ? 'dark-mode' : ''} ${
              prefs.favoriteColor
            }`}
            ariaLabel="data source"
          />
          <CustomButton
            onClick={onCustomLog}
            text="Custom"
            icon={<AddIcon />}
            className="custom-add-button"
          />
        </Box>

        {renderList()}
      </Box>

      <SlideDialog
        open={isItemSelected}
        onClose={onCloseItemDetails}
        component={
          <ItemDetails
            onAddToMealClick={onAddToMealClick}
            isCustomLog={isCustomLog}
          />
        }
        title={isCustomLog ? 'Custom Log' : 'Item'}
        type="full"
      />
    </>
  )
}
