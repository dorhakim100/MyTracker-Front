import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { DialogActions } from '@mui/material'
import { ChatRoot, useChatStore } from '@mui/x-chat-headless'
import {
  ChatComposer,
  ChatConversation,
  ChatMessageList,
} from '@mui/x-chat'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { MessageRole } from '../../../types/message/Message'
import { createExerciseChatAdapter } from '../../../services/message/exercise-chat.adapter'
import {
  getChatMessageText,
  toChatMessage,
} from '../../../services/message/exercise-chat.mapper'
import { messageService } from '../../../services/message/message.service'
import { CustomAlertDialog } from '../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { exerciseChatNs } from '../locals'
import type { ChatMessage } from '@mui/x-chat-headless'

interface ExerciseChatProps {
  workoutId: string
  exerciseId: string
  role: MessageRole
  exerciseName: string
  workoutName: string
}

const LONG_PRESS_MS = 420
const LONG_PRESS_MOVE_PX = 12

export function ExerciseChat({
  workoutId,
  exerciseId,
  role,
  exerciseName,
  workoutName,
}: ExerciseChatProps) {
  const { t } = useTranslation(exerciseChatNs)
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const longPressRef = useRef<{
    timer: number | null
    startX: number
    startY: number
  }>({ timer: null, startX: 0, startY: 0 })

  const adapter = useMemo(
    () => createExerciseChatAdapter({ workoutId, exerciseId, role }),
    [workoutId, exerciseId, role]
  )

  const conversationId = `${workoutId}:${exerciseId}`

  function clearLongPress() {
    if (longPressRef.current.timer != null) {
      window.clearTimeout(longPressRef.current.timer)
      longPressRef.current.timer = null
    }
  }

  function closeMessageActions() {
    containerRef.current
      ?.querySelectorAll('[data-chat-actions="open"]')
      .forEach((node) => node.removeAttribute('data-chat-actions'))
  }

  function onPointerDownCapture(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest('.MuiChatMessage-actions')) {
      clearLongPress()
      return
    }

    closeMessageActions()

    const article = target.closest(
      '.MuiChatMessage-roleUser'
    ) as HTMLElement | null
    if (!article) {
      clearLongPress()
      return
    }

    longPressRef.current.startX = event.clientX
    longPressRef.current.startY = event.clientY
    clearLongPress()
    longPressRef.current.timer = window.setTimeout(() => {
      longPressRef.current.timer = null
      article.setAttribute('data-chat-actions', 'open')
    }, LONG_PRESS_MS)
  }

  function onPointerMoveCapture(event: PointerEvent<HTMLDivElement>) {
    if (longPressRef.current.timer == null) return
    const dx = Math.abs(event.clientX - longPressRef.current.startX)
    const dy = Math.abs(event.clientY - longPressRef.current.startY)
    if (dx > LONG_PRESS_MOVE_PX || dy > LONG_PRESS_MOVE_PX) {
      clearLongPress()
    }
  }

  return (
    <div
      ref={containerRef}
      className={`exercise-chat-container ${prefs.favoriteColor || ''}`}
      onPointerDownCapture={onPointerDownCapture}
      onPointerMoveCapture={onPointerMoveCapture}
      onPointerUpCapture={clearLongPress}
      onPointerCancelCapture={clearLongPress}
    >
      <ChatRoot
        key={conversationId}
        className='exercise-chat-root'
        adapter={adapter}
        currentUser={{
          id: role,
          role: 'user',
          displayName: user?.details.fullname,
          avatarUrl: user?.details.imgUrl,
        }}
        members={[
          {
            id: 'trainer',
            role: role === 'trainer' ? 'user' : 'assistant',
            displayName: t('trainer'),
          },
          {
            id: 'trainee',
            role: role === 'trainee' ? 'user' : 'assistant',
            displayName: t('trainee'),
          },
        ]}
        initialConversations={[
          {
            id: conversationId,
            title: exerciseName,
            subtitle: workoutName,
          },
        ]}
        initialActiveConversationId={conversationId}
        localeText={{
          composerInputPlaceholder: t('placeholder'),
          threadNoMessagesLabel: t('empty'),
          threadNoMessagesHelperText: t('emptyHint'),
          messageEditedLabel: t('edited'),
        }}
      >
        <ExerciseChatThread
          role={role}
          favoriteColor={prefs.favoriteColor || ''}
          onCloseMessageActions={closeMessageActions}
        />
      </ChatRoot>
    </div>
  )
}

function ExerciseChatThread({
  role,
  favoriteColor,
  onCloseMessageActions,
}: {
  role: MessageRole
  favoriteColor: string
  onCloseMessageActions: () => void
}) {
  const { t } = useTranslation(exerciseChatNs)
  const store = useChatStore()
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingMessage, setDeletingMessage] = useState<ChatMessage | null>(
    null
  )

  async function onSaveEdit() {
    if (!editingMessage) return
    const content = editValue.trim()
    if (!content) return
    const updated = await messageService.update(editingMessage.id, {
      role,
      content,
    })
    const nextMessage = updated?._id
      ? toChatMessage(updated, role)
      : editingMessage
    store.updateMessage(editingMessage.id, {
      ...nextMessage,
      parts: [{ type: 'text', text: content }],
      editedAt:
        nextMessage.editedAt || new Date().toISOString(),
    })
    setEditingMessage(null)
    setEditValue('')
    onCloseMessageActions()
  }

  async function onConfirmDelete() {
    if (!deletingMessage) return
    await messageService.remove(deletingMessage.id, role)
    store.removeMessage(deletingMessage.id)
    setDeletingMessage(null)
    onCloseMessageActions()
  }

  return (
    <>
      <ChatConversation className='exercise-chat-thread'>
        <ChatMessageList
          features={{
            dateDivider: true,
            streamingIndicator: false,
          }}
          slotProps={{
            messageActions: (context) => {
              const isOwn = context.message?.author?.id === role
              if (!isOwn || !context.message) {
                return { extraActions: [], sx: { display: 'none' } }
              }
              const message = context.message
              return {
                extraActions: [
                  {
                    id: 'edit',
                    label: t('edit'),
                    icon: <EditIcon fontSize='medium' />,
                    onClick: () => {
                      setEditingMessage(message)
                      setEditValue(getChatMessageText(message))
                    },
                  },
                  {
                    id: 'delete',
                    label: t('delete'),
                    icon: <DeleteIcon fontSize='medium' />,
                    onClick: () => setDeletingMessage(message),
                  },
                ],
              }
            },
          }}
        />
        <ChatComposer
          variant='compact'
          features={{ attachments: false }}
        />
      </ChatConversation>
      <CustomAlertDialog
        open={Boolean(editingMessage)}
        onClose={() => setEditingMessage(null)}
        title={t('editTitle')}
        className={`exercise-chat-edit-dialog ${favoriteColor}`}
      >
        <textarea
          className='exercise-chat-edit-input'
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={t('placeholder')}
          rows={6}
          autoFocus
        />
        <DialogActions>
          <CustomButton
            text={t('cancel')}
            fullWidth
            onClick={() => setEditingMessage(null)}
          />
          <CustomButton
            text={t('save')}
            fullWidth
            disabled={!editValue.trim()}
            onClick={onSaveEdit}
            className={`${favoriteColor}`}
          />
        </DialogActions>
      </CustomAlertDialog>
      <CustomAlertDialog
        open={Boolean(deletingMessage)}
        onClose={() => setDeletingMessage(null)}
        title={t('delete')}
      >
        <p>{t('deleteConfirm')}</p>
        <DialogActions>
          <CustomButton
            text={t('cancel')}
            fullWidth
            onClick={() => setDeletingMessage(null)}
          />
          <CustomButton
            text={t('delete')}
            fullWidth
            onClick={onConfirmDelete}
            className={`${favoriteColor} delete-account-button`}
          />
        </DialogActions>
      </CustomAlertDialog>
    </>
  )
}
