import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { searchService } from '../../services/search/search-service'

import { RootState } from '../../store/store'
import {
  CustomToggle,
  ToggleOption,
} from '../../CustomMui/CustomToggle/CustomToggle'

export function ItemSearch() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [query, setQuery] = useState('')
  const [results] = useState<
    readonly { id: string; label: string; subtitle?: string }[]
  >([])
  const [loading] = useState(false)

  const [source, setSource] = useState('usda')

  useEffect(() => {
    if (query) {
      searchService.search(query).then((res) => {
        console.log(res)
        // setResults(...) // normalize here later
      })
    }
  }, [query])

  const onClose = () => {
    console.log('onClose')
  }

  const toggleOptions: ToggleOption[] = [
    { value: 'usda', label: 'Food' },
    { value: 'open-food-facts', label: 'Product' },
  ]

  return (
    <Box className={`item-search ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <Box className='search-bar'>
        <TextField
          fullWidth
          size='medium'
          autoFocus
          placeholder='Search items...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton aria-label='close' onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
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
        {loading ? (
          <Box className='loading'>
            <CircularProgress size={28} />
          </Box>
        ) : results.length ? (
          <List>
            {results.map((item) => (
              <ListItemButton key={item.id}>
                <ListItemText primary={item.label} secondary={item.subtitle} />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Box className='empty'>
            <Typography variant='body2'>No results</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
