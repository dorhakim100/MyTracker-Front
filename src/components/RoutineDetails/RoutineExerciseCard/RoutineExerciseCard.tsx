import { Fragment, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { Exercise, Set } from '../../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { MarqueeText } from '../../MarqueeText/MarqueeText'
import { BodyPartBadges } from '../../BodyPartBadge/BodyPartBadge'
import { routineExerciseCardNs } from './locals'
// import { Divider } from '@mui/material'
// import { useSelector } from 'react-redux'
// import { RootState } from '../../../store/store'

interface RoutineExerciseCardProps {
  exercise: Exercise
  sets: Set[]
  onOpen: () => void
}

function formatNumber(value: number | undefined, suffix?: string) {
  if (typeof value !== 'number') return '—'
  return suffix ? `${value} ${suffix}` : `${value}`
}

function exerciseMuscles(exercise: Exercise) {
  return [
    ...(exercise.mainMuscles || []),
    ...(exercise.secondaryMuscles || []),
    ...(exercise.muscleGroups || []),
  ]
}

export function RoutineExerciseCard({
  exercise,
  sets,
  onOpen,
}: RoutineExerciseCardProps) {
  // const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const { t } = useTranslation(routineExerciseCardNs)
  const usesRpe = Boolean(sets[0]?.rpe)
  const kg = t('kg')

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen()
  }

  return (
    <article
      className='routine-exercise-card-container pointer'
      role='button'
      tabIndex={0}
      aria-label={exercise.name}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      <div className='exercise-header'>
        {exercise.image ? (
          <img
            src={exercise.image}
            alt=''
          />
        ) : null}
        <div className='exercise-copy'>
          <MarqueeText
            variant='body1'
            className='exercise-name'
          >
            {capitalizeFirstLetter(exercise.name)}
          </MarqueeText>
          <BodyPartBadges
            muscles={exerciseMuscles(exercise)}
            size='s'
          />
        </div>
      </div>
      {sets.length > 0 && (
        <div className='sets-table'>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>{t('set')}</TableCell>
                <TableCell>{t('weight')}</TableCell>
                <TableCell>{t('reps')}</TableCell>
                <TableCell>{usesRpe ? t('rpe') : t('rir')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sets.map((set, index) => {
                const effort = usesRpe ? set.rpe : set.rir
                // const setNumber = set.setNumber || index + 1
                return (
                  <Fragment key={set._id || `${exercise.exerciseId}-${index}`}>
                    <TableRow>
                      {/* <TableCell
                        rowSpan={2}
                        className='set-number'
                      >
                        {setNumber}
                      </TableCell> */}
                      <TableCell
                        className={`row-label ${set.isDone ? 'done' : ''}`}
                      >
                        {t('expected')}
                      </TableCell>
                      <TableCell>
                        {formatNumber(set.weight?.expected, kg)}
                      </TableCell>
                      <TableCell>{formatNumber(set.reps?.expected)}</TableCell>
                      <TableCell>{formatNumber(effort?.expected)}</TableCell>
                    </TableRow>
                    <TableRow
                      className={`actual-row ${set.isDone ? 'done' : ''}`}
                    >
                      <TableCell className='row-label'>{t('actual')}</TableCell>
                      <TableCell>
                        {formatNumber(set.weight?.actual, kg)}
                      </TableCell>
                      <TableCell>{formatNumber(set.reps?.actual)}</TableCell>
                      <TableCell>{formatNumber(effort?.actual)}</TableCell>
                    </TableRow>
                    {/* {index < sets.length - 1 && (
                      <TableRow className='set-divider'>
                        <TableCell colSpan={4}>
                          <Divider />
                        </TableCell>
                      </TableRow>
                    )} */}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </article>
  )
}
