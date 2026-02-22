import { useTranslation } from 'react-i18next'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton.tsx'
import { Typography } from '@mui/material'

import downloadAnimation from '../../../public/download-animation.gif'
import iosInstructions from '../../../public/ios-download.png'
import logo from '../../../public/logo-square.png'

type Props = {
  promptInstall: () => Promise<void>
  platform: 'ios' | 'android' | 'desktop'
  isInstallable: boolean
}

export function PwaInstall({ promptInstall, platform, isInstallable }: Props) {
  const { t } = useTranslation()
  return (
    <div className='pwa-install-container'>
      <div className='title-container'>
        <img src={logo} alt='logo' className='logo-image' />
        <Typography variant='h3'>{t('pwa.installApp')}</Typography>
        {/* <img src={downloadAnimation} alt='download-animation' /> */}
      </div>
      {platform === 'ios' ? (
        <img
          src={iosInstructions}
          alt='ios-instructions'
          className='ios-instructions-image'
        />
      ) : (
        <div className='install-container'>
          <Typography variant='h6'>
            {t('pwa.installBestExperience')}
          </Typography>
          <img
            src={downloadAnimation}
            alt='download-animation'
            className='download-animation'
          />
          <CustomButton
            onClick={promptInstall}
            text={t('common.install')}
            fullWidth
            disabled={!isInstallable}
          />
        </div>
      )}
    </div>
  )
}
