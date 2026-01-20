import { Typography, Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import { ProfileCard } from '../../../../components/ProfileCard/ProfileCard'
import { useMemo } from 'react'

export function Trainees() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const trainees = useSelector((state: RootState) => state.userModule.trainees)

  const traineesToDisplay = useMemo(() => {
    return trainees.filter((trainee) => trainee._id !== user?._id)
  }, [trainees, user])

  return (
    <Box>
      <Typography variant="h4" className='bold-header' >
        Trainees
      </Typography>


      {traineesToDisplay.map((trainee) => (
        <ProfileCard key={trainee._id} userToDisplay={trainee} />
      ))}



    </Box>
  )
}
