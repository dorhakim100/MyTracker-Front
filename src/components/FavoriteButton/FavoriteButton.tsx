import { useState } from 'react'
import { IconButton } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { motion } from 'framer-motion'

export function FavoriteButton({ isFavorite }: { isFavorite: boolean }) {
  const [liked, setLiked] = useState(isFavorite)

  return (
    <motion.div
      whileTap={{ scale: 0.8 }}
      animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className='favorite-button-container'
    >
      <IconButton
        onClick={() => setLiked(!liked)}
        color={liked ? 'error' : 'default'}
        className='favorite-button'
        sx={{
          transition: 'color 0.3s ease',
          //   backgroundColor: 'transparent',
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        <FavoriteIcon
          sx={{
            fill: liked ? '#d32f2f' : 'default',
          }}
        />
      </IconButton>
    </motion.div>
  )
}
