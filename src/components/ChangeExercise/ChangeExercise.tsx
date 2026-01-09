import { Exercise } from '../../types/exercise/Exercise'

interface ChangeExerciseProps {
  exerciseToChange: Exercise
}

export function ChangeExercise({ exerciseToChange }: ChangeExerciseProps) {
  return <div>ChangeExercise {exerciseToChange.name}</div>
}
