import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import { useState, useEffect, useCallback } from 'react'
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
import { setItem } from '../../store/actions/item.actions'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { handleFavorite } from '../../store/actions/user.actions'
import { SearchFilter } from '../../types/searchFilter/SearchFilter'
import { Typography } from '@mui/material'

export function ItemSearch() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const user = useSelector((state: RootState) => state.userModule.user)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])

  const [source, setSource] = useState(searchTypes.usda)

  const [isItemSelected, setIsItemSelected] = useState(false)

  // const isLoading = useSelector((state: RootState) => state.systemModule.isLoading)

  const toggleOptions: ToggleOption[] = [
    { value: searchTypes.usda, label: 'Food' },
    { value: searchTypes.openFoodFacts, label: 'Product' },
  ]

  const handleSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!query) {
        const res = await searchService.search({
          favoriteItems: user?.favoriteItems,
        })
        setResults(res)
        // setResults([])
        return
      }

      if (!source) {
        showErrorMsg(messages.error.search)
        return
      }

      const searchQuery: SearchFilter = {
        txt: query,
        source: source as 'usda' | 'open-food-facts',
        favoriteItems: user?.favoriteItems || { food: [], product: [] },
      }

      const res = await searchService.search(searchQuery)
      setResults(res)
    } catch {
      showErrorMsg(messages.error.search)
    } finally {
      setIsLoading(false)
    }
  }, [query, source, user])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  const onClearQuery = () => {
    setQuery('')
  }

  const onItemClick = (item: Item) => {
    console.log('onItemClick', item)
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

  const renderList = () => {
    if (!results.length)
      return (
        <Box className='results'>
          <Typography variant='h6' className='no-results'>
            No results
          </Typography>
        </Box>
      )

    return (
      <Box className='results'>
        <CustomList<Item>
          items={results}
          getKey={(item) => item._id || item.searchId || ''}
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
            className={`source-toggle ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            ariaLabel='data source'
          />
        </Box>

        {renderList()}
      </Box>

      <SlideDialog
        open={isItemSelected}
        onClose={() => setIsItemSelected(false)}
        component={<ItemDetails />}
        title='Item'
        onSave={() => {}}
        type='full'
      />
    </>
  )
}
