import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseChat } from './ExerciseChat/ExerciseChat'
import { MessageRole } from '../../types/message/Message'
import { messageService } from '../../services/message/message.service'
import {
  refetchUnreadSummaries,
  setActiveChatRoom,
} from '../../services/message/unread-summary.store'
import { capitalizeFirstLetter } from '../../services/util.service'
import { RootState } from '../../store/store'
import { exerciseChatNs } from './locals'

interface ExerciseChatDialogProps {
  open: boolean
  onClose: () => void
  workoutId: string
  exerciseId?: string
  role: MessageRole
  exerciseName?: string
  workoutName: string
  traineeName?: string
  variant?: 'exercise' | 'session'
}

export function ExerciseChatDialog({
  open,
  onClose,
  workoutId,
  exerciseId,
  role,
  exerciseName = '',
  workoutName,
  traineeName,
  variant = 'exercise',
}: ExerciseChatDialogProps) {
  const { t } = useTranslation(exerciseChatNs)
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const isSession = variant === 'session'

  useEffect(() => {
    if (!open || !workoutId || (!isSession && !exerciseId)) {
      setActiveChatRoom(null)
      return
    }

    let cancelled = false

    setActiveChatRoom({
      workoutId,
      exerciseId: isSession ? undefined : exerciseId,
      traineeId: traineeUser?._id,
    })

    const markRead = async () => {
      try {
        await messageService.markRead(
          workoutId,
          isSession ? undefined : exerciseId
        )
        if (!cancelled) await refetchUnreadSummaries()
      } catch {
        if (!cancelled) await refetchUnreadSummaries()
      }
    }
    markRead()

    return () => {
      cancelled = true
      setActiveChatRoom(null)
    }
  }, [open, workoutId, exerciseId, isSession, traineeUser?._id])

  const titleParts = [
    isSession ? '' : capitalizeFirstLetter(exerciseName),
    workoutName,
    traineeName,
  ].filter(Boolean)

  return (
    <SlideDialog
      open={open}
      onClose={onClose}
      title={titleParts.join(' · ') || t('title')}
      type='full'
      enableSwipeToClose={true}
      isFromAlertDialog={true}
      component={
        open ? (
          <ExerciseChat
            workoutId={workoutId}
            exerciseId={isSession ? undefined : exerciseId}
            role={role}
            exerciseName={capitalizeFirstLetter(exerciseName)}
            workoutName={workoutName}
            variant={variant}
          />
        ) : (
          <></>
        )
      }
    />
  )
}
