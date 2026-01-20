import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Typography } from '@mui/material'
import { Card } from '@mui/material'
import { EditIcon } from '../EditIcon/EditIcon'
import { RootState } from '../../store/store'
import { EditUser } from '../EditUser/EditUser'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { User } from '../../types/user/User'
import { optimisticUpdateUser, setTrainees } from '../../store/actions/user.actions'
import { updateUser } from '../../store/actions/user.actions'
import { showSuccessMsg } from '../../services/event-bus.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

interface ProfileCardProps {
  userToDisplay?: User
}

export function ProfileCard({ userToDisplay }: ProfileCardProps) {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const traineeUser = useSelector(
    (storeState: RootState) => storeState.userModule.traineeUser
  )

  const trainees = useSelector(
    (storeState: RootState) => storeState.userModule.trainees
  )

  const userToEdit = useMemo(() => {
    return userToDisplay || user
  }, [userToDisplay, user])

  const [isEditUserOpen, setIsEditUserOpen] = useState<boolean>(false)

  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false)

  const onOpenEditUser = () => {
    setIsEditUserOpen(true)
  }

  const onCloseEditUser = () => {
    setIsEditUserOpen(false)
  }
  const onOpenAlertDialog = () => {
    setOpenAlertDialog(true)
  }
  const onCloseAlertDialog = () => {
    setOpenAlertDialog(false)
  }

  const onSaveEditUser = async (userToUpdate: User) => {



    if (userToUpdate._id === user?._id) {
      optimisticUpdateUser(userToUpdate)
    } else {
      const traineeIdx = trainees.findIndex(trainee => trainee._id === userToUpdate._id)
      const newTrainees = [...trainees]
      newTrainees[traineeIdx] = userToUpdate
      setTrainees(newTrainees)
    }
    onCloseEditUser()
    try {
      await updateUser(userToUpdate)
      showSuccessMsg(messages.success.updateUser)
    } catch (err) {


      showErrorMsg(messages.error.updateUser)
      if (userToUpdate._id === user?._id) {
        optimisticUpdateUser(userToUpdate)
      }
    }
  }
  return (
    <>
      <Card
        variant="outlined"
        className={`card user-details ${prefs.isDarkMode ? 'dark-mode' : ''} ${traineeUser?._id === userToDisplay?._id ? 'selected' : ''} ${prefs.favoriteColor}`}
      >
        <EditIcon onClick={onOpenEditUser} />
        <div className="profile-container" onClick={onOpenAlertDialog}>
          <img
            className="profile-avatar  box-shadow white-outline"
            src={userToEdit?.details?.imgUrl || '/logo-square.png'}
            alt="Profile"
          />
          <div className="profile-info">
            <Typography variant="h5" className="text-overflow">
              {userToEdit?.details?.fullname || 'User Profile'}
            </Typography>

            <Typography variant="body1">
              {userToEdit?.details?.height || 0} cm
            </Typography>
            <Typography variant="body1">
              {new Date(userToEdit?.details?.birthdate || 0).toLocaleDateString('he')}
            </Typography>
          </div>
        </div>
      </Card>
      <SlideDialog
        open={isEditUserOpen}
        onClose={onCloseEditUser}
        component={<EditUser onSave={onSaveEditUser} selectedUser={userToEdit} />}
        title="Edit User"
        // onSave={() => onSaveEditUser(user as User)}
        type="full"
      />
      <CustomAlertDialog
        open={openAlertDialog}
        onClose={onCloseAlertDialog}
        title="Profile Picture"
      >
        <div className="modal-profile-picture-container">
          <img
            src={userToEdit?.details?.imgUrl || '/logo-square.png'}
            alt="Profile"
            className={`profile-picture box-shadow white-outline`}
          />
          <CustomButton
            text="Cancel"
            fullWidth
            onClick={onCloseAlertDialog}
            className={`${prefs.favoriteColor}`}
          />
        </div>
      </CustomAlertDialog>
    </>
  )
}
