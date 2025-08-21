import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import { useState, useEffect } from 'react'
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
import { SearchQuery } from '../../types/searchQuery/SearchQuery'
import { setIsLoading } from '../../store/actions/system.actions'

const DEFAULT_IMAGE = 'https://cdn-icons-png.flaticon.com/512/5235/5235253.png'

export function ItemSearch() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const [source, setSource] = useState(searchTypes.usda)

  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )

  const toggleOptions: ToggleOption[] = [
    { value: searchTypes.usda, label: 'Food' },
    { value: searchTypes.openFoodFacts, label: 'Product' },
  ]

  useEffect(() => {
    handleSearch()
  }, [query, source])

  const onClose = () => {
    console.log('onClose')
  }

  async function handleSearch() {
    setIsLoading(true)
    try {
      if (!query) {
        // showErrorMsg(messages.error.search)
        return
      }

      if (!source) {
        showErrorMsg(messages.error.search)
        return
      }

      const searchQuery: SearchQuery = {
        txt: query,
        source: source as 'usda' | 'open-food-facts',
      }

      const res = await searchService.search(searchQuery)
      setResults(res)
    } catch (err) {
      showErrorMsg(messages.error.search)
    } finally {
      setIsLoading(false)
    }
  }

  //   if (isLoading)
  //     return (
  //       <Box className='loading'>
  //         <CircularProgress size={28} />
  //       </Box>
  //     )

  //   if (!results.length)
  //     return (
  //       <Box className='empty'>
  //         <Typography variant='body2'>No results</Typography>
  //       </Box>
  //     )

  return (
    <Box className={`item-search ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <Box className='search-container'>
        <CustomInput
          value={query}
          onChange={setQuery}
          placeholder='Search items...'
          startIconFn={() => <SearchIcon />}
          endIconFn={() => (
            <IconButton aria-label='close' onClick={onClose}>
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

      <Box className='results'>
        <List>
          {results.map((item: any) => (
            <ListItemButton key={item?.id}>
              <ListItemIcon>
                <img
                  src={item?.image || DEFAULT_IMAGE}
                  alt={item?.name}
                  className='item-image'
                />
              </ListItemIcon>

              <ListItemText
                primary={item?.name}
                secondary={`${item?.macros?.calories} kcal`}
                className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  )
}
