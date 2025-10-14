import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Typography } from '@mui/material'
import { DialogActions } from '@mui/material'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

export function DeleteAccountCard({
  onDeleteAccount,
  setDeleteModalClose,
}: {
  onDeleteAccount: () => void
  setDeleteModalClose: () => void
}) {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  return (
    <>
      <Typography variant='body1'>
        Are you sure you want to delete your account?
      </Typography>

      <Typography variant='body2'>
        This action is irreversible and will delete all your data.
      </Typography>
      <DialogActions>
        <CustomButton
          fullWidth
          onClick={setDeleteModalClose}
          className={`${prefs.favoriteColor}`}
          text='Cancel'
        />
        <CustomButton
          fullWidth
          onClick={onDeleteAccount}
          className={`${prefs.favoriteColor} delete-account-button`}
          text='Delete'
        />
      </DialogActions>
    </>
  )
}
