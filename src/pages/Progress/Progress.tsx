// import { Card, Typography } from '@mui/material'
// import { GoalsCard } from '../../components/GoalsCard/GoalsCard'
import { WeightChart } from '../../components/WeightChart/WeightChart'
// import { useSelector } from 'react-redux'
// import { RootState } from '../../store/store'

export function Progress() {
  // const prefs = useSelector(
  //   (storeState: RootState) => storeState.systemModule.prefs
  // )

  return (
    <div className='page-container progress-container'>
      <WeightChart />
      {/* <Card
        variant='outlined'
        className={`card goals-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <Typography variant='h6'>Goals</Typography>
        <GoalsCard />
      </Card> */}
    </div>
  )
}
