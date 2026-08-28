import { MessageRole } from '../../types/message/Message'

type UserLike = { _id?: string; isTrainer?: boolean } | null | undefined

export function isWatchingTrainee(
  user: UserLike,
  traineeUser: UserLike,
  userToEdit: UserLike
) {
  if (!user?._id || !user.isTrainer) return false
  if (traineeUser?._id && traineeUser._id !== user._id) return true
  if (userToEdit?._id && userToEdit._id !== user._id) return true
  return false
}

export function getChatRole(options: {
  isExpected?: boolean
  user?: UserLike
  traineeUser?: UserLike
  userToEdit?: UserLike
  isDashboard?: boolean
}): MessageRole {
  const {
    isExpected = false,
    user,
    traineeUser,
    userToEdit,
    isDashboard = false,
  } = options

  if (
    isWatchingTrainee(user, traineeUser, userToEdit) ||
    (isDashboard && user?.isTrainer)
  ) {
    return 'trainer'
  }

  return isExpected ? 'trainer' : 'trainee'
}
