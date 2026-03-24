import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Bounce, ToastContainer, toast } from 'react-toastify'

import { SHOW_MSG, eventBus } from '../../services/event-bus.service'
import { RootState } from '../../store/store'

import 'react-toastify/dist/ReactToastify.css'

interface UserMsgData {
  txt: string
  type: 'success' | 'error'
}

const USER_MSG_TOAST_ID = 'user-msg-toast'
const AUTO_CLOSE_MS =  3000

export const UserMsg: React.FC = () => {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const themeClassName = useMemo(() => {
    return `toast-theme ${prefs.isDarkMode ? 'dark-mode' : 'light-mode'} ${
      prefs.favoriteColor || 'primary'
    }`
  }, [prefs.favoriteColor, prefs.isDarkMode])

  useEffect(() => {
    const unsubscribe = eventBus.on(SHOW_MSG, (incomingMsg: UserMsgData) => {
      const toastType = incomingMsg.type === 'success' ? 'success' : 'error'
      const title = incomingMsg.type === 'success' ? 'Success' : 'Error'
      const content = (
        <div className='user-msg-content'>
          <div className='user-msg-title'>{title}</div>
          <div className='user-msg-text'>{incomingMsg.txt}</div>
        </div>
      )

      const className = `${themeClassName} ${incomingMsg.type}`

      if (toast.isActive(USER_MSG_TOAST_ID)) {
        toast.update(USER_MSG_TOAST_ID, {
          render: content,
          type: toastType,
          className,
          autoClose: AUTO_CLOSE_MS,
          progress: undefined,
          closeButton: false,
        })
        return
      }

      toast(content, {
        toastId: USER_MSG_TOAST_ID,
        type: toastType,
        className,
        autoClose: AUTO_CLOSE_MS,
        closeButton: false,
      })
    })

    return () => {
      unsubscribe()
    }
  }, [themeClassName])

  return (
    <ToastContainer
      className='user-msg-container'
      toastClassName='user-msg-toast'
      position='top-center'
      newestOnTop
      autoClose={AUTO_CLOSE_MS}
      closeButton={false}
      hideProgressBar={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      draggableDirection='y'
      pauseOnHover={false}
      theme='colored'
      transition={Bounce}
      limit={1}
    />
  )
}
