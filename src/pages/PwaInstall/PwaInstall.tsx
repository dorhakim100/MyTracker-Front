import { CustomButton } from '../../CustomMui/CustomButton/CustomButton.tsx'
import { Typography } from '@mui/material'

import downloadAnimation from '../../../public/download-animation.gif'

interface PwaInstallProps {
  promptInstall: () => void
}
export function PwaInstall({ promptInstall }: PwaInstallProps) {
  return (
    <div className='pwa-install-container'>
      <Typography variant='h3'>Install the app</Typography>
      <Typography variant='h6'>
        To get the best experience, please install the app.
      </Typography>
      <img
        src={downloadAnimation}
        alt='download-animation'
        className='download-animation'
      />
      <CustomButton onClick={promptInstall} text='Install' fullWidth />
    </div>
  )
}
