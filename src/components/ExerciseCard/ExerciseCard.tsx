import { Card, Typography, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Exercise } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { ExerciseEditor } from '../ExerciseEditor/ExerciseEditor'
import { CustomOptionsMenu } from '../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

interface ExerciseCardProps {
  exercise: Exercise
  className?: string
  onDelete?: (exercise: Exercise) => void
  onEdit?: (exercise: Exercise) => void
  onClick?: (exercise: Exercise) => void
  showEquipment?: boolean
  showActions?: boolean
  instructions?: ExerciseInstructions
}

export function ExerciseCard({
  exercise,
  className = '',
  onDelete,
  onEdit,
  onClick,
  showEquipment = false,
  showActions = true,
  instructions,
}: ExerciseCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const handleClick = () => {
    if (onClick) {
      onClick(exercise)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(exercise)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(exercise)
    }
  }

  return (
    <Card
      className={`exercise-card-container ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${prefs.favoriteColor}`}
      onClick={handleClick}
    >
      <div className="exercise-card-content">
        {exercise.image && (
          <img
            src={exercise.image}
            alt={exercise.name}
            className="exercise-card-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <CustomOptionsMenu
          className="more-options-container"
          options={[]}
          triggerElement={
            <CustomButton
              isIcon={true}
              icon={<MoreHorizIcon />}
              className={`more-options ${prefs.favoriteColor} ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
            />
          }
        />
        <div className="exercise-card-info">
          <Typography variant="h6" className="exercise-card-name">
            {capitalizeFirstLetter(exercise.name)}
          </Typography>
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <Typography variant="body2" className="exercise-card-muscle-groups">
              {exercise.muscleGroups
                .map((muscleGroup) => capitalizeFirstLetter(muscleGroup))
                .join(', ')}
            </Typography>
          )}
          {showEquipment &&
            exercise.equipment &&
            exercise.equipment.length > 0 && (
              <>
                <Divider
                  className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                />
                <Typography variant="body2" className="exercise-card-equipment">
                  {exercise.equipment
                    .map((eq) => capitalizeFirstLetter(eq))
                    .join(', ')}
                </Typography>
              </>
            )}
        </div>
      </div>
      {instructions && instructions.sets && (
        <ExerciseEditor exercise={instructions} updateExercise={() => {}} />
      )}
    </Card>
  )
}
