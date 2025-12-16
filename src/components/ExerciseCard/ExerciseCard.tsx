import { useState } from 'react'
import { Card, Typography, Divider, DialogActions } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Exercise } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { ExerciseEditor } from '../ExerciseEditor/ExerciseEditor'
import { CustomOptionsMenu } from '../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Instructions } from '../../types/instructions/Instructions'

import EditNoteIcon from '@mui/icons-material/EditNote'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import { DropdownOption } from '../../types/DropdownOption'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import SwitchLeftIcon from '@mui/icons-material/SwitchLeft'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { NotesDisplay } from '../NotesDisplay/NotesDisplay'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import DragHandleIcon from '@mui/icons-material/DragHandle'

interface ExerciseCardProps {
  exercise: Exercise
  className?: string
  onDelete?: (exercise: Exercise) => void
  onEdit?: (exercise: Exercise) => void
  onClick?: (exercise: Exercise) => void
  showEquipment?: boolean
  showActions?: boolean
  exerciseInstructions?: ExerciseInstructions
  isExpected?: boolean
  onEditExerciseNotes: (exerciseId: string, notes: string) => void
  setInstructions?: (instructions: Instructions) => void
  instructions: Instructions
  onSwitchRpeRir: (exerciseId: string, value: 'rpe' | 'rir') => void
  setIsReorderExercisesOpen: (isOpen: boolean) => void
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
  isExpected = false,
  onEditExerciseNotes,
  setInstructions,
  exerciseInstructions,
  onSwitchRpeRir,
  setIsReorderExercisesOpen,
}: ExerciseCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const updateExercise = (exercise: ExerciseInstructions) => {
    if (!setInstructions) return
    setInstructions({
      ...instructions,
      exercises: instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId ? exercise : e
      ),
    })
  }

  console.log('exerciseInstructions', exerciseInstructions)

  const [isOpen, setIsOpen] = useState(false)
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false)

  const [editNotes, setEditNotes] = useState(
    isExpected
      ? exerciseInstructions?.notes?.expected
      : exerciseInstructions?.notes?.actual
  )

  const handleClick = () => {
    if (onClick) {
      onClick(exercise)
    }
  }

  const menuOptions = [
    {
      title: 'View Details',
      icon: <InfoOutlineIcon />,
      onClick: () => {
        setIsOpen(true)
      },
    },
    isExpected && {
      title: `Toggle to ${exerciseInstructions?.sets[0]?.rpe ? 'RIR' : 'RPE'}`,
      icon: <SwitchLeftIcon />,
      onClick: () => {
        const modeToSet = exerciseInstructions?.sets[0]?.rpe ? 'rir' : 'rpe'
        console.log('modeToSet', modeToSet)
        onSwitchRpeRir(exercise.exerciseId, modeToSet)
      },
    },
    {
      title: 'Edit Notes',
      icon: <EditNoteIcon />,
      onClick: () => {
        console.log('edit notes', exercise)
        setIsEditNotesOpen(true)
      },
    },

    isExpected
      ? {
          title: 'Reorder Exercises',
          icon: <DragHandleIcon />,
          onClick: () => {
            setIsReorderExercisesOpen(true)
          },
        }
      : null,
    (isExpected && {
      title: 'Delete',
      icon: <DeleteIcon />,
      onClick: () => {
        if (onDelete) {
          onDelete(exercise)
        }
      },
    }) ||
      null,
  ].filter((option) => option !== null) as DropdownOption[]

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
    <>
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
            options={menuOptions}
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
              <Typography
                variant="body2"
                className="exercise-card-muscle-groups"
              >
                {exercise.muscleGroups
                  .map((muscleGroup) => capitalizeFirstLetter(muscleGroup))
                  .join(', ')}
              </Typography>
            )}

            <Typography variant="body2" className="exercise-card-notes">
              {`${!isExpected ? 'Expected ' : ''}Notes: ${
                exerciseInstructions?.notes?.expected || ''
              }`}
            </Typography>
            {!isExpected && (
              <Typography variant="body2" className="exercise-card-notes">
                {`Actual Notes: ${exerciseInstructions?.notes?.actual || ''}`}
              </Typography>
            )}
            {showEquipment &&
              exercise.equipment &&
              exercise.equipment.length > 0 && (
                <>
                  <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  />
                  <Typography
                    variant="body2"
                    className="exercise-card-equipment"
                  >
                    {exercise.equipment
                      .map((eq) => capitalizeFirstLetter(eq))
                      .join(', ')}
                  </Typography>
                </>
              )}
          </div>
        </div>
        {exerciseInstructions && exerciseInstructions.sets && (
          <ExerciseEditor
            exercise={exerciseInstructions}
            updateExercise={updateExercise}
            isExpected={isExpected}
          />
        )}
      </Card>
      <SlideDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={capitalizeFirstLetter(exercise.name)}
        component={<ExerciseDetails exercise={exercise} />}
        type="full"
      />
      <CustomAlertDialog
        open={isEditNotesOpen}
        onClose={() => setIsEditNotesOpen(false)}
        title={capitalizeFirstLetter(exercise.name)}
      >
        <Typography variant="h6">Add Notes</Typography>

        <CustomInput
          value={editNotes || ''}
          onChange={setEditNotes}
          placeholder={`${capitalizeFirstLetter(exercise.name)} notes`}
          isRemoveIcon={true}
          className={`${prefs.favoriteColor}`}
        />
        <DialogActions>
          <CustomButton
            text="Cancel"
            fullWidth
            onClick={() => setIsEditNotesOpen(false)}
            className={`${prefs.favoriteColor}`}
          />
          <CustomButton
            text="Save"
            fullWidth
            onClick={() => {
              onEditExerciseNotes(exercise.exerciseId, editNotes || '')
              setIsEditNotesOpen(false)
              setEditNotes('')
            }}
            className={`${prefs.favoriteColor}`}
          />
        </DialogActions>
      </CustomAlertDialog>
    </>
  )
}
