import { Typography, Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import { useMemo } from 'react'
import { TraineesList } from '../../../TrainerDashboard/components/TraineesList/TraineesList'
import { TRAINEE_ORDER_STORE_NAME } from '../../../../constants/store.constants'

export function Trainees() {
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const trainees = useSelector((state: RootState) => state.userModule.trainees)

  const traineesToDisplay = useMemo(() => {
    const traineesOrder: string[] = JSON.parse(
      localStorage.getItem(TRAINEE_ORDER_STORE_NAME) || '[]'
    )
    return trainees
      .filter((trainee) => trainee._id !== user?._id)
      .sort((a, b) => {
        const aIndex = traineesOrder.indexOf(a._id)
        const bIndex = traineesOrder.indexOf(b._id)
        return aIndex - bIndex
      })
  }, [trainees, user])

  return (
    <Box>
      <Typography
        variant='h4'
        className='bold-header'
      >
        Trainees
      </Typography>

      {/* <CustomButton

        text="Add Trainee"
        icon={<AddIcon />}
      /> */}

      <TraineesList trainees={traineesToDisplay} />
    </Box>
  )
}
