import { searchUrls } from '../../assets/config/search.urls'
import { Exercise } from '../../types/exercise/Exercise'
import { exerciseImage } from '../../assets/config/exercise-image'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'

export const imageService = {
  showDefaultImage,
  renderErrorExerciseImage,
  getFormattedExercise,
}

function showDefaultImage(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = e.currentTarget
  if (img.src === searchUrls.DEFAULT_IMAGE) return
  img.src = searchUrls.DEFAULT_IMAGE
}

function renderErrorExerciseImage(
  exercise: Exercise,
  exerciseResults: Exercise[],
  renderExercises: (exercises: Exercise[]) => void
) {
  const newExerciseResults = exerciseResults.map((e) =>
    e.exerciseId === exercise.exerciseId ? getFormattedExercise(e) : e
  )
  renderExercises(newExerciseResults as Exercise[])
}

function getFormattedExercise(exercise: Exercise | ExerciseInstructions) {
  return {
    ...exercise,
    image: exerciseImage.ERROR_IMAGE,
  }
}
