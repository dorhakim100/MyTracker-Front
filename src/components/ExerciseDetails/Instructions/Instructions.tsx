import { useEffect, useRef } from 'react'
import { CustomAnimatedText } from '../../../CustomMui/CustomAnimatedText/CustomAnimatedText'

const visitedExerciseIds: string[] = []

interface InstructionsProps {
  name?: string
  image: string
  text: string
  exerciseId?: string
  onImageError: () => void
}

export function Instructions({
  name,
  image,
  text,
  exerciseId,
  onImageError,
}: InstructionsProps) {
  const visitExerciseId = useRef<string | undefined>(undefined)
  const disableAnimation = useRef(false)

  if (visitExerciseId.current !== exerciseId) {
    visitExerciseId.current = exerciseId
    disableAnimation.current = visitedExerciseIds.includes(exerciseId || '')
  }

  useEffect(() => {
    if (!exerciseId) return
    if (visitedExerciseIds.includes(exerciseId)) return
    visitedExerciseIds.push(exerciseId)
  }, [exerciseId])

  return (
    <>
      <img
        src={image}
        alt={name}
        onError={onImageError}
      />
      <CustomAnimatedText
        className='exercise-instructions'
        typeSpeed={8}
        disableAnimation={disableAnimation.current}
      >
        {text}
      </CustomAnimatedText>
    </>
  )
}
