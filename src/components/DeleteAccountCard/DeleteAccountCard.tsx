import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  return (
    <>
      <Typography variant='body1'>
        {t('user.deleteAccountConfirm')}
      </Typography>

      <Typography variant='body2'>
        {t('user.deleteAccountIrreversible')}
      </Typography>
      <DialogActions>
        <CustomButton
          fullWidth
          onClick={setDeleteModalClose}
          className={`${prefs.favoriteColor}`}
          text={t('common.cancel')}
        />
        <CustomButton
          fullWidth
          onClick={onDeleteAccount}
          className={`${prefs.favoriteColor} delete-account-button`}
          text={t('common.delete')}
        />
      </DialogActions>
    </>
  )
}
