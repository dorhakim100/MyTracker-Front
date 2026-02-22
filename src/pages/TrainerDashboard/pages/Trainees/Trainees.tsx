import { useTranslation } from 'react-i18next'
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
import { setIsLoading } from '../../../../store/actions/system.actions'
import { addTrainee } from '../../../../store/actions/user.actions'
import { AxiosError } from 'axios'

export interface AddTraineeForm {
  fullname: string
  email: string
  trainerId: string
}

interface AlertDialogProps {
  open: boolean
  type: 'add' | null
  title: string
}

export function Trainees() {
  const { t } = useTranslation()
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )
  if (!user) {
    return null
  }

  const trainees = useSelector((state: RootState) => state.userModule.trainees)

  const [alertDialog, setAlertDialog] = useState<AlertDialogProps>({
    open: false,
    type: null,
    title: '',
  })

  const [addTraineeForm, setAddTraineeForm] = useState<AddTraineeForm>({
    fullname: '',
    email: '',
    trainerId: user._id,
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

  const handleAddTrainee = async () => {
    try {
      setIsLoading(true)
      console.log('handleAddTrainee')
      console.log(addTraineeForm)
      await addTrainee(addTraineeForm)
      handleClose()
    } catch (error) {
      console.log(error)
      const { err } = (error as AxiosError<{ err: string }>).response?.data as {
        err: string
      }

      setErrorMessage(err)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddTraineeDialog = () => {
    setAlertDialog({
      open: true,
      type: 'add',
      title: t('trainer.addTrainee'),
    })
  }

  return (
    <>
      <Box>
        <Typography
          variant='h4'
          className='bold-header'
        >
          {t('nav.trainees')}
        </Typography>

        <div className='add-trainee-container'>
          <MyTraineeCard displayTrainees={false} />
          <CustomButton
            text={t('trainer.addTrainee')}
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
        className='add-trainee-dialog'
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
