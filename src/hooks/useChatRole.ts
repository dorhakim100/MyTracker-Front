import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { MessageRole } from '../types/message/Message'
import { getChatRole } from '../services/message/chat-role'

export function useChatRole(isExpected = false): MessageRole {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )
  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  return getChatRole({
    isExpected,
    user,
    traineeUser,
    userToEdit,
    isDashboard,
  })
}
