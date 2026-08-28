import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface WorkoutIconProps {
  className?: string
}

export function WorkoutIcon({ className = '' }: WorkoutIconProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <div
      className={`workout-icon-container ${prefs.favoriteColor} ${className}`.trim()}
      aria-hidden='true'
    >
      <FitnessCenterIcon
        color='inherit'
        className={prefs.favoriteColor}
      />
    </div>
  )
}
