import { getArrayOfNumbers } from '../../services/util.service'
import { ClockPicker } from '../Pickers/ClockPicker'

interface WeightEditProps {
  value: number
  onChange: (value: number) => void
  isHideSaveButton?: boolean
  onClose?: () => void
}

export function WeightEdit({
  value,
  onChange,
  isHideSaveButton = false,
  onClose = () => {},
}: WeightEditProps) {
  return (
    <ClockPicker
      value={value}
      onChange={(_, next) => onChange(next)}
      onClose={onClose}
      minValue={30}
      maxValue={150}
      valuesToDisplay={getArrayOfNumbers(30, 150) as number[]}
      isButtonsVisible={false}
      isSaveCancelButtonsVisible={!isHideSaveButton}
    />
  )
}
