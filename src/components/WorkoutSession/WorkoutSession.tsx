import { useCallback, useState } from 'react'
import { Typography } from '@mui/material'

import { SessionDay } from '../../types/workout/SessionDay'
import { Exercise } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../services/util.service'
import { setSelectedSessionDay } from '../../store/actions/workout.action'

import { ExerciseEditor } from '../../components/ExerciseEditor/ExerciseEditor'

import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { instructionsService } from '../../services/instructions/instructions.service'
import { setIsLoading } from '../../store/actions/system.actions'

import { Instructions } from '../../types/instructions/Instructions'
interface WorkoutSessionProps {
  sessionDay: SessionDay
  onExerciseInfoClick: (exercise: Exercise) => void
}

export function WorkoutSession({
  sessionDay,
  onExerciseInfoClick,
}: WorkoutSessionProps) {
  if (!sessionDay.instructions) return null

  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(
    new Set()
  )

  const workouts = useSelector(
    (state: RootState) => state.workoutModule.workouts
  )

  const handleAccordionChange = useCallback(
    (exerciseId: string) =>
      (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedExercises((prev) => {
          const newSet = new Set(prev)
          if (isExpanded) {
            newSet.add(exerciseId)
          } else {
            newSet.delete(exerciseId)
          }
          return newSet
        })
      },
    []
  )

  const toggleExpandAll = () => {
    if (!sessionDay?.workout?.exercises) return
    const allExerciseIds = sessionDay.workout.exercises.map(
      (ex) => ex.exerciseId
    )
    const allExpanded = allExerciseIds.every((id) => expandedExercises.has(id))

    if (allExpanded) {
      setExpandedExercises(new Set())
    } else {
      setExpandedExercises(new Set(allExerciseIds))
    }
  }

  const getWorkoutName = () => {
    const workoutId = sessionDay.instructions.workoutId

    const workout = workouts.find((w) => w._id === workoutId)
    return workout?.name
  }

  const updateExercise = async (exercise: ExerciseInstructions) => {
    const originalInstructions = sessionDay.instructions
    const newInstructions = {
      ...sessionDay.instructions,
      exercises: sessionDay.instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId ? exercise : e
      ),
    }
    if (getIsStringifySame(originalInstructions, newInstructions)) return
    setSelectedSessionDay({
      ...sessionDay,
      instructions: newInstructions,
    })
    try {
      await saveNewInstructions(newInstructions)
    } catch (err) {
      setSelectedSessionDay({
        ...sessionDay,
        instructions: originalInstructions,
      })
    }
  }

  async function saveNewInstructions(newInstructions: Instructions) {
    try {
      setIsLoading(true)
      await instructionsService.save(newInstructions)
    } catch (err) {
      showErrorMsg(messages.error.updateSet)
    } finally {
      setIsLoading(false)
    }
  }

  function getIsStringifySame(
    originalInstructions: Instructions,
    newInstructions: Instructions
  ) {
    return (
      JSON.stringify(originalInstructions) === JSON.stringify(newInstructions)
    )
  }

  const allExerciseIds = sessionDay.instructions.exercises.map(
    (ex) => ex.exerciseId
  )
  const allExpanded =
    allExerciseIds.length > 0 &&
    allExerciseIds.every((id) => expandedExercises.has(id))

  return (
    <div className='workout-container'>
      <div className='workout-header-container'>
        <Typography variant='h5' className='bold-header'>
          {getWorkoutName()}
        </Typography>
        <CustomButton
          icon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={toggleExpandAll}
        />
      </div>
      <div className='exercises-container'>
        {sessionDay.instructions.exercises.map((exercise) => {
          const isExpanded = expandedExercises.has(exercise.exerciseId)

          return (
            <CustomAccordion
              key={`${exercise.exerciseId}-${sessionDay._id}`}
              title={capitalizeFirstLetter(exercise.name || '')}
              cmp={
                <ExerciseEditor
                  exercise={exercise}
                  updateExercise={updateExercise}
                />
              }
              expanded={isExpanded}
              onChange={handleAccordionChange(exercise.exerciseId)}
              icon={
                <InfoOutlineIcon
                  onClick={(ev) => {
                    ev.stopPropagation()
                    onExerciseInfoClick(exercise as Exercise)
                  }}
                />
              }
            />
          )
        })}
      </div>
    </div>
  )
}
