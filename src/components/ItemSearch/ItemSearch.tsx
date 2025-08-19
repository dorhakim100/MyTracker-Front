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

export function ItemSearch() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      searchService.search(query).then((res) => {
        console.log(res)
        // setResults(res.products)
      })
    }
  }, [query])

  const onSelect = (item: any) => {
    console.log('onSelect', item)
  }

  const onClose = () => {
    console.log('onClose')
  }

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
            endAdornment: onClose ? (
              <InputAdornment position='end'>
                <IconButton aria-label='close' onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
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
              <ListItemButton key={item.id} onClick={() => onSelect?.(item)}>
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
