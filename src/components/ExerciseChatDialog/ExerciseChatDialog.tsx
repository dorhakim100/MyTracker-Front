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
  exerciseId: string
  role: MessageRole
  exerciseName: string
  workoutName: string
  traineeName?: string
}

export function ExerciseChatDialog({
  open,
  onClose,
  workoutId,
  exerciseId,
  role,
  exerciseName,
  workoutName,
  traineeName,
}: ExerciseChatDialogProps) {
  const { t } = useTranslation(exerciseChatNs)
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  useEffect(() => {
    if (!open || !workoutId || !exerciseId) {
      setActiveChatRoom(null)
      return
    }

    setActiveChatRoom({
      workoutId,
      exerciseId,
      traineeId: traineeUser?._id,
    })
    void messageService
      .markRead(workoutId, exerciseId)
      .then(() => refetchUnreadSummaries())

    return () => setActiveChatRoom(null)
  }, [open, workoutId, exerciseId, traineeUser?._id])

  const titleParts = [
    capitalizeFirstLetter(exerciseName),
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
      component={
        open ? (
          <ExerciseChat
            workoutId={workoutId}
            exerciseId={exerciseId}
            role={role}
            exerciseName={capitalizeFirstLetter(exerciseName)}
            workoutName={workoutName}
          />
        ) : (
          <></>
        )
      }
    />
  )
}
