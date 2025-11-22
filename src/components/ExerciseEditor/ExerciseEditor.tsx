import { Typography } from '@mui/material'
import { Exercise } from '../../types/exercise/Exercise'
import { getArrayOfNumbers } from '../../services/util.service'

export interface ExerciseEditorProps {
  exercise: Exercise
}

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  console.log('exercise', exercise)
  return (
    <div className='exercise-editor-container'>
      {/* {
        getArrayOfNumbers(exercise.details.sets.actual).map((set)=>{

        })
      } */}
    </div>
  )
}
