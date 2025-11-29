import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { Typography } from '@mui/material'

import { RootState } from '../../store/store'
import { SessionDay } from '../../types/workout/SessionDay'
import { Exercise } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../services/util.service'

import { ExerciseEditor } from '../../components/ExerciseEditor/ExerciseEditor'

import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface WorkoutSessionProps {
  sessionDay: SessionDay
  onExerciseInfoClick: (exercise: Exercise) => void
}

export function WorkoutSession({
  sessionDay,
  onExerciseInfoClick,
}: WorkoutSessionProps) {
  if (!sessionDay.instructions) return null

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(
    new Set()
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
          {sessionDay?.workout?.name}
        </Typography>
        <CustomButton
          icon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={toggleExpandAll}
        />
      </div>
      <div className='exercises-container'>
        {sessionDay.instructions.exercises.map((exercise) => {
          // console.log('exercise:', exercise)
          const isExpanded = expandedExercises.has(exercise.exerciseId)

          return (
            <CustomAccordion
              key={`${exercise.exerciseId}-${sessionDay._id}`}
              title={capitalizeFirstLetter(exercise.name || '')}
              cmp={<ExerciseEditor exercise={exercise} />}
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
