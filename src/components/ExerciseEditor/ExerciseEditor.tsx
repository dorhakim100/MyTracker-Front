import { Typography } from '@mui/material'
import { Exercise } from '../../types/exercise/Exercise'

export interface ExerciseEditorProps {
  exercise: Exercise
}

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  return (
    <div className='exercise-editor-container'>
      <div className='exercise-editor-header'>
        <Typography variant='h6'>{exercise.name}</Typography>
      </div>
    </div>
  )
}
