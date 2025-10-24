import { CustomButton } from '../../CustomMui/CustomButton/CustomButton.tsx'
import { Typography } from '@mui/material'

import downloadAnimation from '../../../public/download-animation.gif'
import iosInstructions from '../../../public/ios-download.png'

type Props = {
  promptInstall: () => Promise<void>
  platform: 'ios' | 'android' | 'desktop'
  isInstallable: boolean
}

export function PwaInstall({ promptInstall, platform, isInstallable }: Props) {
  return (
    <div className='pwa-install-container'>
      <Typography variant='h3'>Install the app</Typography>
      {platform === 'ios' ? (
        <div className='ios-instructions'>
          <img
            src={iosInstructions}
            alt='ios-instructions'
            className='ios-instructions-image'
          />
        </div>
      ) : (
        <div className='install-container'>
          <Typography variant='h6'>
            To get the best experience, please install the app.
          </Typography>
          <img
            src={downloadAnimation}
            alt='download-animation'
            className='download-animation'
          />
          <CustomButton
            onClick={promptInstall}
            text='Install'
            fullWidth
            disabled={!isInstallable}
          />
        </div>
      )}
    </div>
  )
}
