import { CustomButton } from '../../CustomMui/CustomButton/CustomButton.tsx'

interface PwaInstallProps {
  promptInstall: () => void
}
export function PwaInstall({ promptInstall }: PwaInstallProps) {
  return (
    <div className='pwa-install-container'>
      <CustomButton onClick={promptInstall} text='Install' />
    </div>
  )
}
