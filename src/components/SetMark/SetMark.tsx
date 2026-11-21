import { Badge, CircularProgress } from '@mui/material'
import { Set } from '../../types/exercise/Exercise'
import { setMark, setTypeOf } from '../../services/set/set-type'
import { SetType } from '../../types/exercise/SetType'

interface SetMarkProps {
  sets: { type?: Set['type'] }[]
  index: number
  set: Set
  className?: string
  onClick?: () => void
  showSpinner?: boolean
}

export function SetMark({
  sets,
  index,
  set,
  className = '',
  onClick,
  showSpinner = false,
}: SetMarkProps) {
  const during = set.isDuringWorkout ? 'during-workout' : ''
  const typeClass = typeClassFor(setTypeOf(set))

  const setMarkValue = setMark(sets, index)
  const isTwoDigits = +setMarkValue > 9
  return (
    <div
      className={`set-mark-container set-number  ${during} ${typeClass} ${className}`}
      onClick={
        onClick
          ? (event) => {
              event.stopPropagation()
              onClick()
            }
          : undefined
      }
    >
      {showSpinner ? (
        <CircularProgress
          size={22.5}
          className={className}
        />
      ) : (
        <Badge
          badgeContent={setMarkValue}
          color='primary'
          className={`set-number ${during} ${typeClass} ${
            isTwoDigits ? 'two-digits' : ''
          } ${className}`}
        />
      )}
      {set.isDuringWorkout && <span className='set-mark-plus'>+</span>}
    </div>
  )
}

const TYPE_CLASS: Record<Exclude<SetType, 'normal'>, string> = {
  warmUp: 'set-type-warm-up',
  failure: 'set-type-failure',
  drop: 'set-type-drop',
  myoReps: 'set-type-myo',
}

function typeClassFor(type: SetType) {
  if (type === 'normal') return ''
  return TYPE_CLASS[type]
}
