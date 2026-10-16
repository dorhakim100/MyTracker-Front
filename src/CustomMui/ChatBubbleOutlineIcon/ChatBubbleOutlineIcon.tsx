import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline'
import Notes from '@mui/icons-material/Notes'

import type { SvgIconProps } from '@mui/material/SvgIcon'
import type { User } from '../../types/user/User'

interface ChatBubbleOutlineIconProps extends SvgIconProps {
  user?: User | null
}

export function ChatBubbleOutlineIcon({
  user,
  className = '',
  ...iconProps
}: ChatBubbleOutlineIconProps) {
  const classNames = `chat-bubble-outline-icon-container ${className}`.trim()

  if (user?.trainersIds?.length) {
    return (
      <ChatBubbleOutline
        {...iconProps}
        className={classNames}
      />
    )
  }

  return (
    <Notes
      {...iconProps}
      className={classNames}
    />
  )
}
