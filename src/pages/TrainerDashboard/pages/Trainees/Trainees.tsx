import { Typography, Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import { useMemo, useState } from 'react'
import { TraineesList } from '../../../TrainerDashboard/components/TraineesList/TraineesList'
import { TRAINEE_ORDER_STORE_NAME } from '../../../../constants/store.constants'

import { MyTraineeCard } from '../../../../components/MyTraineeCard/MyTraineeCard'

import AddIcon from '@mui/icons-material/Add'
import { CustomButton } from '../../../../CustomMui/CustomButton/CustomButton'
import { CustomAlertDialog } from '../../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { SaveCancel } from '../../../../components/SaveCancel/SaveCancel'
import { AddTrainee } from '../../../../components/AddTrainee/AddTrainee'

export interface AddTraineeForm {
  fullname: string
  email: string
}

interface AlertDialogProps {
  open: boolean
  type: 'add' | null
  title: string
}

export function Trainees() {
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const trainees = useSelector((state: RootState) => state.userModule.trainees)

  const [alertDialog, setAlertDialog] = useState<AlertDialogProps>({
    open: false,
    type: null,
    title: '',
  })

  const [addTraineeForm, setAddTraineeForm] = useState<AddTraineeForm>({
    fullname: '',
    email: '',
  })

  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleChange = (field: string, value: string) => {
    setAddTraineeForm({ ...addTraineeForm, [field]: value })
    if (field === 'email' && /\S+@\S+\.\S+/.test(value)) {
      setErrorMessage('')
    }
  }

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

  const handleClose = () => {
    setAlertDialog({
      open: false,
      type: null,
      title: '',
    })
  }

  const handleAddTrainee = () => {
    setAlertDialog({
      open: false,
      type: null,
      title: '',
    })
  }

  const openAddTraineeDialog = () => {
    setAlertDialog({
      open: true,
      type: 'add',
      title: 'Add Trainee',
    })
  }

  return (
    <>
      <Box>
        <Typography
          variant='h4'
          className='bold-header'
        >
          Trainees
        </Typography>

        <div className='add-trainee-container'>
          <MyTraineeCard displayTrainees={false} />
          <CustomButton
            text='Add Trainee'
            icon={<AddIcon />}
            onClick={openAddTraineeDialog}
          />
        </div>

        <TraineesList trainees={traineesToDisplay} />
      </Box>

      <CustomAlertDialog
        open={alertDialog.open}
        onClose={handleClose}
        title={alertDialog.title}
      >
        <div className='add-trainee-dialog-content'>
          <AddTrainee
            form={addTraineeForm}
            handleChange={handleChange}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
          <SaveCancel
            onSave={handleAddTrainee}
            onCancel={handleClose}
          />
        </div>
      </CustomAlertDialog>
    </>
  )
}
