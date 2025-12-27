import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Typography } from '@mui/material'
import { Card } from '@mui/material'
import { EditIcon } from '../EditIcon/EditIcon'
import { RootState } from '../../store/store'
import { EditUser } from '../EditUser/EditUser'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { User } from '../../types/user/User'
import { optimisticUpdateUser } from '../../store/actions/user.actions'
import { updateUser } from '../../store/actions/user.actions'
import { showSuccessMsg } from '../../services/event-bus.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

export function ProfileCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

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

  const onSaveEditUser = async (user: User) => {
    optimisticUpdateUser(user)
    onCloseEditUser()
    try {
      await updateUser(user)
      showSuccessMsg(messages.success.updateUser)
    } catch (err) {
      showErrorMsg(messages.error.updateUser)
      optimisticUpdateUser(user as User)
    }
  }
  return (
    <>
      <Card
        variant="outlined"
        className={`card user-details ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <EditIcon onClick={onOpenEditUser} />
        <div className="profile-container" onClick={onOpenAlertDialog}>
          <img
            className="profile-avatar  box-shadow white-outline"
            src={user?.details?.imgUrl || '/logo-square.png'}
            alt="Profile"
          />
          <div className="profile-info">
            <Typography variant="h5" className="text-overflow">
              {user?.details?.fullname || 'User Profile'}
            </Typography>

            <Typography variant="body1">
              {user?.details?.height || 0} cm
            </Typography>
            <Typography variant="body1">
              {new Date(user?.details?.birthdate || 0).toLocaleDateString('he')}
            </Typography>
          </div>
        </div>
      </Card>
      <SlideDialog
        open={isEditUserOpen}
        onClose={onCloseEditUser}
        component={<EditUser onSave={onSaveEditUser} />}
        title="Edit User"
        onSave={() => onSaveEditUser(user as User)}
        type="full"
      />
      <CustomAlertDialog
        open={openAlertDialog}
        onClose={onCloseAlertDialog}
        title="Profile Picture"
      >
        <div className="modal-profile-picture-container">
          <img
            src={user?.details?.imgUrl || '/logo-square.png'}
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
