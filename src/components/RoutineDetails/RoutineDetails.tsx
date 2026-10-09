import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CheckIcon from '@mui/icons-material/Check'
import EditIcon from '@mui/icons-material/Edit'
import BarChartIcon from '@mui/icons-material/BarChart'
import { RootState } from '../../store/store'
import { Workout } from '../../types/workout/Workout'
import { Exercise } from '../../types/exercise/Exercise'
import { Instructions } from '../../types/instructions/Instructions'
import { WeekNumberStatus } from '../../types/weekNumberStatus/WeekNumberStatus'
import { SessionDay } from '../../types/workout/SessionDay'
import { SessionStatsRecap } from '../../types/stats/Stats'
import { instructionsService } from '../../services/instructions/instructions.service'
import { sessionService } from '../../services/session/session.service'
import { statsService } from '../../services/stats/stats.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { capacitorService } from '../../services/capacitor.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomToggle } from '../../CustomMui/CustomToggle/CustomToggle'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { useSlideDialogHeaderAction } from '../SlideDialog/slide-dialog-header-action'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { SessionStats } from '../SessionStats/SessionStats'
import { sessionStatsNs } from '../SessionStats/locals'
import { EditWorkout } from '../../pages/LiftMate/EditWorkout/EditWorkout'
import { useChatRole } from '../../hooks/useChatRole'
import { useUnreadSummary } from '../../hooks/useUnreadSummary'
import { useScrollLastChildIntoView } from '../../hooks/useScrollLastChildIntoView'
import { ExerciseChatDialog } from '../ExerciseChatDialog/ExerciseChatDialog'
import { RoutineExerciseCard } from './RoutineExerciseCard/RoutineExerciseCard'
import { routineDetailsNs } from './locals'
import {
  finishedSessions,
  formatSessionDate,
  statusCopy,
  toExercise,
  weekState,
  weekTimes,
} from './utils'
import { Divider } from '@mui/material'

interface RoutineDetailsProps {
  workout: Workout
}

export function RoutineDetails({ workout }: RoutineDetailsProps) {
  const { t } = useTranslation(routineDetailsNs)
  const { t: tApp } = useTranslation()
  const { t: tStats } = useTranslation(sessionStatsNs)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )
  const forUserId = traineeUser?._id || user?._id || ''
  const chatRole = useChatRole()
  const { getExerciseCount, hasExerciseMessages } = useUnreadSummary(chatRole)
  const traineeName =
    chatRole === 'trainer' && traineeUser && traineeUser._id !== user?._id
      ? traineeUser.details.fullname
      : undefined

  const [weeksStatus, setWeeksStatus] = useState<WeekNumberStatus[]>([])
  const [weekNumber, setWeekNumber] = useState<number | null>(null)
  const [instructions, setInstructions] = useState<Instructions | null>(null)
  const [sessions, setSessions] = useState<SessionDay[]>([])
  const [isWeekLoading, setIsWeekLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [chatExercise, setChatExercise] = useState<Exercise | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [recap, setRecap] = useState<SessionStatsRecap | null>(null)
  const [isStatsOpen, setIsStatsOpen] = useState(false)

  const [loadingStatisticsId, setLoadingStatisticsId] = useState<string | null>(
    null
  )
  const editOpenRef = useRef(false)
  const weekNumberRef = useRef<number | null>(null)
  const requestRef = useRef(0)
  const weekToggleRef = useScrollLastChildIntoView(
    'MuiToggleButtonGroup-grouped',
    weeksStatus
  )
  weekNumberRef.current = weekNumber

  const loadInstructions = useCallback(
    async (week: number) => {
      if (!workout._id || !forUserId) return
      const requestId = ++requestRef.current
      setIsWeekLoading(true)
      try {
        const next = await instructionsService.getByWorkoutId({
          workoutId: workout._id,
          forUserId,
          weekNumber: week,
        })
        if (requestId !== requestRef.current) return
        setWeekNumber(week)
        setInstructions(next)
      } catch {
        if (requestId !== requestRef.current) return
        showErrorMsg(tApp('messages.error.getWorkoutInstructions'))
      } finally {
        if (requestId === requestRef.current) setIsWeekLoading(false)
      }
    },
    [workout._id, forUserId, tApp]
  )

  const loadWeeks = useCallback(
    async (preferredWeek?: number) => {
      if (!workout._id || !forUserId) {
        setHasLoaded(true)
        return
      }
      const requestId = ++requestRef.current
      setIsWeekLoading(true)
      try {
        const statuses = await instructionsService.getWeekNumberDone(
          workout._id
        )
        if (requestId !== requestRef.current) return
        const sorted = (Array.isArray(statuses) ? statuses : [])
          .slice()
          .sort(
            (a: WeekNumberStatus, b: WeekNumberStatus) =>
              a.weekNumber - b.weekNumber
          )
        setWeeksStatus(sorted)
        const canKeep = sorted.some(
          (status) => status.weekNumber === preferredWeek
        )
        const weekToOpen = canKeep
          ? preferredWeek
          : sorted[sorted.length - 1]?.weekNumber
        if (!weekToOpen) {
          setWeekNumber(null)
          setInstructions(null)
          return
        }
        const next = await instructionsService.getByWorkoutId({
          workoutId: workout._id,
          forUserId,
          weekNumber: weekToOpen,
        })
        if (requestId !== requestRef.current) return
        setWeekNumber(weekToOpen)
        setInstructions(next)
      } catch {
        if (requestId !== requestRef.current) return
        showErrorMsg(tApp('messages.error.getWorkoutInstructions'))
      } finally {
        if (requestId === requestRef.current) {
          setIsWeekLoading(false)
          setHasLoaded(true)
        }
      }
    },
    [workout._id, forUserId, tApp]
  )

  useEffect(() => {
    loadWeeks()
  }, [loadWeeks])

  useEffect(() => {
    const doneTimes = instructions?.doneTimes ?? 0
    const workoutId = workout._id
    if (!instructions || doneTimes <= 0 || !workoutId || !forUserId) {
      setSessions([])
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await sessionService.listByWorkoutWeek(
          forUserId,
          workoutId,
          instructions.weekNumber
        )
        if (cancelled) return
        setSessions(finishedSessions(res, workoutId, instructions.weekNumber))
      } catch {
        if (cancelled) return
        setSessions([])
        showErrorMsg(tApp('messages.error.getSessionDay'))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [instructions, workout._id, forUserId, tApp])

  const openEdit = useCallback(() => {
    editOpenRef.current = true
    setIsEditOpen(true)
  }, [])

  const editAction = useMemo(
    () => (
      <CustomButton
        isIcon={true}
        icon={<EditIcon />}
        variant='flat'
        className='slide-dialog-header-action'
        tooltipTitle={t('editRoutine')}
        onClick={openEdit}
      />
    ),
    [openEdit, t]
  )

  useSlideDialogHeaderAction(editAction)

  const { doneTimes, timesPerWeek } = weekTimes(instructions)
  const status = weekState(doneTimes, timesPerWeek)
  const statusLabel = t(statusCopy(status))

  const isWeekMarkedDone = (statusWeek: WeekNumberStatus) => {
    if (statusWeek.isDone) return true
    return statusWeek.weekNumber === weekNumber && status === 'finished'
  }

  const onCloseEdit = () => {
    if (!editOpenRef.current) return
    editOpenRef.current = false
    setIsEditOpen(false)
    loadWeeks(weekNumberRef.current || undefined)
  }

  const onOpenSession = async (session: SessionDay) => {
    if (!session._id) return
    capacitorService.vibrate('Light')
    try {
      const next = await statsService.getRecap(session._id)
      setRecap(next)
      setIsStatsOpen(true)
    } catch {
      showErrorMsg(tApp('messages.error.getSessionDay'))
    }
  }

  const onOpenStatistics = async (session: SessionDay) => {
    if (!session || !session._id) {
      showErrorMsg(tApp('messages.error.getSessionDay'))
      return
    }
    setLoadingStatisticsId(session._id)
    try {
      await onOpenSession(session)
    } catch {
    } finally {
      setLoadingStatisticsId(null)
    }
  }

  return (
    <div className='routine-details-container'>
      {weeksStatus.length > 0 && (
        <div
          ref={weekToggleRef}
          className='week-toggle'
        >
          <CustomToggle
            value={String(weekNumber || '')}
            onChange={(value) => {
              loadInstructions(Number(value))
            }}
            options={weeksStatus.map((statusWeek) => ({
              label: tApp('workout.week'),
              value: String(statusWeek.weekNumber),
              icon: <span>{statusWeek.weekNumber}</span>,
              badgeIcon: isWeekMarkedDone(statusWeek) ? (
                <CheckIcon className='week-done-icon' />
              ) : undefined,
            }))}
            isBadge={true}
            isReversedIcon={true}
            className={`week-number-toggle ${prefs.favoriteColor} ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
          />
        </div>
      )}
      {isWeekLoading && (
        <div className='routine-loading'>
          <CircularProgress
            size={28}
            className={`${prefs.favoriteColor}`}
          />
        </div>
      )}
      {!isWeekLoading && hasLoaded && weeksStatus.length === 0 && (
        <span>{t('noWeeks')}</span>
      )}
      {!isWeekLoading && instructions && (
        <div
          className='week-body'
          key={instructions.weekNumber}
        >
          <div
            className={`week-status ${status === 'finished' ? 'finished' : ''}`}
          >
            <span>
              {doneTimes}/{timesPerWeek}
            </span>
            {status === 'finished' && <CheckIcon className='week-done-icon' />}
            <span>{statusLabel}</span>
          </div>
          {sessions.length > 0 && (
            <div className='session-list'>
              <span className='session-heading'>{t('sessions')}</span>
              <Divider
                className={`${prefs.favoriteColor} ${
                  prefs.isDarkMode ? 'dark-mode' : ''
                } divider`}
                orientation='vertical'
              />
              <List disablePadding>
                {sessions.map((session) => (
                  <ListItemButton
                    key={session._id || session.date}
                    onClick={() => onOpenStatistics(session)}
                  >
                    {loadingStatisticsId === session._id ? (
                      <CircularProgress
                        size={20}
                        // className={`${prefs.favoriteColor}`}
                        color='inherit'
                      />
                    ) : (
                      <BarChartIcon />
                    )}
                    <ListItemText
                      primary={formatSessionDate(session.date, prefs.lang)}
                    />
                  </ListItemButton>
                ))}
              </List>
            </div>
          )}
          {instructions.exercises?.map((instruction, index) => {
            const exercise = toExercise(instruction, workout)
            return (
              <RoutineExerciseCard
                key={`${instruction.exerciseId}-${index}`}
                exercise={exercise}
                sets={instruction.sets || []}
                unreadCount={
                  workout._id
                    ? getExerciseCount(workout._id, exercise.exerciseId)
                    : 0
                }
                hasMessages={
                  workout._id
                    ? hasExerciseMessages(workout._id, exercise.exerciseId)
                    : false
                }
                onOpen={() => {
                  setSelectedExercise(exercise)
                  setIsExerciseOpen(true)
                }}
                onOpenChat={
                  workout._id ? () => setChatExercise(exercise) : undefined
                }
              />
            )
          })}
        </div>
      )}
      <SlideDialog
        open={isExerciseOpen}
        onClose={() => setIsExerciseOpen(false)}
        title={selectedExercise?.name || ''}
        type='full'
        component={
          <ExerciseDetails
            exercise={selectedExercise}
            workoutId={workout._id}
            workoutName={workout.name}
            chatRole={chatRole}
          />
        }
      />
      {workout._id && (
        <ExerciseChatDialog
          open={Boolean(chatExercise)}
          onClose={() => setChatExercise(null)}
          workoutId={workout._id}
          exerciseId={chatExercise?.exerciseId || ''}
          role={chatRole}
          exerciseName={chatExercise?.name || ''}
          workoutName={workout.name}
          traineeName={traineeName}
        />
      )}
      <SlideDialog
        open={isEditOpen}
        onClose={onCloseEdit}
        title={tApp('common.editOption', { option: workout.name })}
        type='full'
        component={
          <EditWorkout
            selectedWorkout={workout}
            closeDialog={onCloseEdit}
          />
        }
      />
      <CustomAlertDialog
        open={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title={tStats('title')}
        type='large'
      >
        <SessionStats
          recap={recap}
          workoutId={workout._id}
          workoutName={workout.name}
          exercises={workout.exercises}
        />
      </CustomAlertDialog>
    </div>
  )
}
