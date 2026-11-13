import { useTranslation } from 'react-i18next'
import { colorOptionNs } from './locals'
import './locals'

interface ColorOptionProps {
  color: string
}

export function ColorOption({ color }: ColorOptionProps) {
  const { t } = useTranslation(colorOptionNs)

  return (
    <span className='color-option'>
      <span className={`color-option-swatch ${color}`} />
      <span>{t(color)}</span>
    </span>
  )
}
