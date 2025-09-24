import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import { ToggleOption } from '../../CustomMui/CustomToggle/CustomToggle'

export const genderOptions: ToggleOption[] = [
  { value: 'male', label: 'Male', icon: <MaleIcon /> },
  { value: 'female', label: 'Female', icon: <FemaleIcon /> },
]
