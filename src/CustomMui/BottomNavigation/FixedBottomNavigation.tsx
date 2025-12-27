import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import { ItemSearch } from '../../components/ItemSearch/ItemSearch'
import { SlideDialog } from '../../components/SlideDialog/SlideDialog'

import SpeedDial from '@mui/material/SpeedDial'
import SearchIcon from '@mui/icons-material/Search'

import Paper from '@mui/material/Paper'
import AddIcon from '@mui/icons-material/Add'
import QrCode2Icon from '@mui/icons-material/QrCode2'

import { mainRoutes, Route } from '../../assets/routes/routes'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import {
  setIsAddModal,
  setNavigateTo,
  setSlideDirection,
} from '../../store/actions/system.actions'
import { setSelectedDiaryDay } from '../../store/actions/user.actions'
import { messages } from '../../assets/config/messages'
import { showErrorMsg } from '../../services/event-bus.service'
import { BarcodeScanner } from '../../components/BarcodeScanner/BarcodeScanner'
import { smoothScroll } from '../../services/util.service'
// import { searchTypes } from '../../assets/config/search-types'

type ModalType = 'search' | 'scan'

const modalTypes = {
  search: 'search' as ModalType,
  scan: 'scan' as ModalType,
}

export function FixedBottomNavigation(props: {
  routes: Route[]
  centerAction?: {
    icon?: React.ReactNode
    onClick?: () => void
    ariaLabel?: string
  }
}) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isAddModal = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isAddModal
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const selectedDay = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.selectedDay
  )

  const timer = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.timer
  )

  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(modalTypes.search)

  const [currIndex, setCurrIndex] = useState(0)

  const filteredRoutes = useMemo(() => {
    // Show only Dashboard, Diary, Workouts, and User in bottom navigation
    return props.routes.filter((route) => mainRoutes.includes(route.path))
  }, [props.routes])

  const midIndex = Math.floor(filteredRoutes.length / 2)
  const leftRoutes = React.useMemo(
    () => filteredRoutes.slice(0, midIndex),
    [filteredRoutes, midIndex]
  )
  const rightRoutes = React.useMemo(
    () => filteredRoutes.slice(midIndex),
    [filteredRoutes, midIndex]
  )

  const speedDialActions = [
    {
      icon: <QrCode2Icon />,
      name: 'Scan',
      onClick: onScanClick,
    },
    {
      icon: <SearchIcon />,
      name: 'Search',
      onClick: onSearchClick,
    },
  ]

  useEffect(() => {
    const index = filteredRoutes.findIndex(
      (route) => route && route.path === location.pathname
    )

    if (index === -1) {
      setValue(0)
      return
    }

    setCurrIndex(index)

    if (index > 1) {
      setValue(index + 1)
    } else {
      setValue(index)
    }
  }, [location.pathname, filteredRoutes])

  function onScanClick() {
    setModalType(modalTypes.scan)
    setSearchModalOpen(true)
    setIsAddModal(false)
  }

  function onSearchClick(ev: React.MouseEvent<HTMLButtonElement>) {
    ev.stopPropagation()
    ev.preventDefault()

    setModalType(modalTypes.search)
    setSearchModalOpen(true)
    setIsAddModal(false)
  }

  function closeSearchModal() {
    setSearchModalOpen(false)
  }

  const renderSpeedDial = () => {
    return (
      <div
        className={`speed-dial-container ${isAddModal ? 'show' : ''} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${prefs.favoriteColor}`}
        onClick={(ev) => {
          ev.stopPropagation()
          ev.preventDefault()

          if (!isAddModal) return
          setIsAddModal(false)
        }}
      >
        <SpeedDial
          // color='primary'
          ariaLabel="SpeedDial basic example"
          aria-label={props.centerAction?.ariaLabel || 'center-action'}
          icon={<AddIcon />}
          onClick={(ev) => {
            if (!user) return showErrorMsg(messages.error.register)
            ev.stopPropagation()
            setIsAddModal(!isAddModal)

            setSelectedDiaryDay({
              ...user.loggedToday,
              weight: selectedDay?.weight,
            })
          }}
          open={isAddModal}
          className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor
          }`}
          sx={{
            display: timer ? 'none' : '',
            // position: 'absolute',
          }}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              onClick={
                action.onClick as unknown as MouseEventHandler<HTMLDivElement>
              }
              className={`${prefs.favoriteColor}`}
            />
          ))}
        </SpeedDial>
      </div>
    )
  }

  return (
    <>
      <Box
        sx={{ pb: 7 }}
        ref={ref}
        className={`fixed-bottom-navigation ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${prefs.favoriteColor}`}
      >
        <CssBaseline />

        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            height: '100px',

            // paddingBottom: '1.5em',
          }}
          elevation={3}
        >
          <Box sx={{ position: 'relative' }}>
            {renderSpeedDial()}

            <BottomNavigation
              showLabels
              value={value}
              onChange={(_, newValue) => {
                setValue(newValue)
              }}
              className={`${prefs.favoriteColor} ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
            >
              {leftRoutes.map((route, index) => {
                if (!route) return null
                return (
                  <BottomNavigationAction
                    key={route.path}
                    label={route.title}
                    icon={<route.icon />}
                    onClick={() => {
                      setSlideDirection(index < currIndex ? -1 : 1)

                      setNavigateTo(route.path)

                      if (route.path === location.pathname) {
                        smoothScroll()
                      } else navigate(route.path)
                    }}
                    className={`${prefs.favoriteColor}`}
                  />
                )
              })}

              {/* Spacer to balance layout under the centered FAB */}
              <BottomNavigationAction sx={{ visibility: 'hidden' }} />

              {rightRoutes.map((route, index) => {
                if (!route) return null
                return (
                  <BottomNavigationAction
                    key={route.path}
                    label={route.title}
                    icon={<route.icon />}
                    onClick={() => {
                      setSlideDirection(
                        index + leftRoutes.length > currIndex ? 1 : -1
                      )

                      if (route.path === location.pathname) {
                        smoothScroll()
                      } else navigate(route.path)
                    }}
                    className={`${prefs.favoriteColor}`}
                  />
                )
              })}
            </BottomNavigation>
          </Box>
        </Paper>
      </Box>

      <SlideDialog
        open={searchModalOpen}
        onClose={closeSearchModal}
        component={
          modalType === modalTypes.search ? (
            <ItemSearch />
          ) : (
            <BarcodeScanner onClose={closeSearchModal} />
          )
        }
        title={modalType === modalTypes.search ? 'Search Food' : 'Scan'}
        type={modalType === modalTypes.search ? 'full' : 'half'}
      />
    </>
  )
}
