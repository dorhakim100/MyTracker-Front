import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { capitalizeFirstLetter } from '../../services/util.service'
import { getExerciseSummary } from '../../services/exersice-search/exersice-search'
import { Exercise, ExerciseDetail } from '../../types/exercise/Exercise'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { translateService } from '../../services/translate/translate.service'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import { Set } from '../../types/exercise/Exercise'

interface ExerciseWithDetails extends Exercise {
  notes?: ExpectedActual<string>
  rpe?: ExpectedActual<number>
  instructions?: string[]
  sets?: ExpectedActual<number>
}
interface ExerciseDetailsProps {
  exercise: ExerciseWithDetails | null
}

export function ExerciseDetails({ exercise }: ExerciseDetailsProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  console.log('exercise:', exercise)

  const [exerciseInstructions, setExerciseInstructions] = useState<
    string[] | null
  >(null)
  useEffect(() => {
    const getWorkoutInstructions = async () => {
      try {
        if (exercise?.instructions) {
          setExerciseInstructions(exercise.instructions)
          return
        }
        const exerciseId = exercise?.exerciseId
        if (!exerciseId) return

        const instructions = await getExerciseSummary(exerciseId)
        setExerciseInstructions(instructions)
      } catch (err) {
        console.error(err)
        showErrorMsg(messages.error.getExerciseSummary)
      }
    }

    getWorkoutInstructions()
  }, [exercise])

  const renderExerciseInstructions = (instruction: string) => {
    const cleaned = instruction.replace(/^Step:\d+\s*/, '')

    return <p key={instruction}>{cleaned}</p>
  }

  const getNotesClass = (notes: string) => {
    return translateService.isLtrString(notes)
      ? 'english-notes'
      : 'hebrew-notes'
  }

  return (
    <div className='exercise-details-container'>
      <img src={exercise?.image} alt={exercise?.name} />
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='exercise-details'>
        {exercise?.notes?.expected && (
          <>
            <Typography variant='h5' className='bold-header'>
              Notes
            </Typography>
            <div
              className={`notes-container ${getNotesClass(
                exercise?.notes?.expected || ''
              )}`}
            >
              {exercise?.notes?.expected}
            </div>
          </>
        )}
        <Typography variant='h5' className='bold-header'>
          Instructions
        </Typography>
        {exerciseInstructions?.map(renderExerciseInstructions)}
      </div>
    </div>
  )
}
