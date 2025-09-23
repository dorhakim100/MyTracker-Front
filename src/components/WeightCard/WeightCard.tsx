import { Card, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

export function WeightCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  return (
    <Card
      variant='outlined'
      className={`card weight-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <Typography variant='h6'>Weight</Typography>

      <CustomButton
        text='Add Weight'
        onClick={() => {
          console.log('add weight')
        }}
      />
    </Card>
  )
}
