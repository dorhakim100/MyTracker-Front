import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { ChatUnreadBadge } from '../../CustomMui/ChatUnreadBadge/ChatUnreadBadge'
import { ChatBubbleOutlineIcon } from '../../CustomMui/ChatBubbleOutlineIcon/ChatBubbleOutlineIcon'
import { ExerciseChatDialog } from '../ExerciseChatDialog/ExerciseChatDialog'
import { exerciseChatNs } from '../ExerciseChatDialog/locals'
import { useUnreadSummary } from '../../hooks/useUnreadSummary'
import { MessageRole } from '../../types/message/Message'

interface SessionChatButtonProps {
  workoutId?: string
  workoutName: string
  role: MessageRole
}

export function SessionChatButton({
  workoutId,
  workoutName,
  role,
}: SessionChatButtonProps) {
  const { t } = useTranslation(exerciseChatNs)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )
  const { getSessionCount, hasSessionMessages } = useUnreadSummary(role)
  const [open, setOpen] = useState(false)

  if (!workoutId) return null

  const owner = traineeUser || user
  const traineeName =
    role === 'trainer' && traineeUser && traineeUser._id !== user?._id
      ? traineeUser.details.fullname
      : undefined

  const onOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setOpen(true)
  }

  return (
    <div className='session-chat-button-container'>
      <ChatUnreadBadge
        count={getSessionCount(workoutId)}
        hasMessages={hasSessionMessages(workoutId)}
        className={prefs.favoriteColor}
      >
        <CustomButton
          isIcon={true}
          icon={<ChatBubbleOutlineIcon user={owner} />}
          variant='flat'
          tooltipTitle={t('openChat')}
          onClick={onOpen}
        />
      </ChatUnreadBadge>
      <ExerciseChatDialog
        open={open}
        onClose={() => setOpen(false)}
        workoutId={workoutId}
        role={role}
        workoutName={workoutName}
        traineeName={traineeName}
        variant='session'
      />
    </div>
  )
}
