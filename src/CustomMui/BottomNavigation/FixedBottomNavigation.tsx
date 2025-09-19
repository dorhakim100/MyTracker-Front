import React, { MouseEventHandler, useEffect, useState } from 'react'
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

import { Route } from '../../assets/routes/routes'
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

  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(modalTypes.search)

  const [currIndex, setCurrIndex] = useState(0)

  const midIndex = Math.floor(props.routes.length / 2)
  const leftRoutes = React.useMemo(
    () => props.routes.slice(0, midIndex),
    [props.routes, midIndex]
  )
  const rightRoutes = React.useMemo(
    () => props.routes.slice(midIndex),
    [props.routes, midIndex]
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
    const index = props.routes.findIndex(
      (route) => route.path === location.pathname
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
  }, [location.pathname, props.routes])

  function onScanClick() {
    setModalType(modalTypes.scan)
    setSearchModalOpen(true)
  }

  function onSearchClick(ev: React.MouseEvent<HTMLButtonElement>) {
    ev.stopPropagation()
    ev.preventDefault()

    setModalType(modalTypes.search)
    setSearchModalOpen(true)
  }

  function closeSearchModal() {
    setSearchModalOpen(false)
  }

  return (
    <>
      <Box
        sx={{ pb: 7 }}
        ref={ref}
        className={`fixed-bottom-navigation ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
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
            <div
              className={`speed-dial-container ${isAddModal ? 'show' : ''}`}
              onClick={(ev) => {
                ev.stopPropagation()
                ev.preventDefault()

                if (!isAddModal) return
                setIsAddModal(false)
              }}
            >
              <SpeedDial
                // color='primary'
                ariaLabel='SpeedDial basic example'
                aria-label={props.centerAction?.ariaLabel || 'center-action'}
                icon={<AddIcon />}
                onClick={(ev) => {
                  if (!user) return showErrorMsg(messages.error.register)
                  ev.stopPropagation()
                  setIsAddModal(!isAddModal)

                  setSelectedDiaryDay(user.loggedToday)
                }}
                open={isAddModal}
                className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
                  prefs.favoriteColor
                }`}
                sx={
                  {
                    // position: 'absolute',
                    // opacity: 0,
                  }
                }
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

            <BottomNavigation
              showLabels
              value={value}
              onChange={(_, newValue) => {
                setValue(newValue)
              }}
            >
              {leftRoutes.map((route, index) => {
                return (
                  <BottomNavigationAction
                    key={route.path}
                    label={route.title}
                    icon={<route.icon />}
                    onClick={() => {
                      setSlideDirection(index < currIndex ? -1 : 1)

                      setNavigateTo(route.path)
                      navigate(route.path)
                    }}
                    className={`${prefs.favoriteColor}`}
                  />
                )
              })}

              {/* Spacer to balance layout under the centered FAB */}
              <BottomNavigationAction sx={{ visibility: 'hidden' }} />

              {rightRoutes.map((route, index) => {
                return (
                  <BottomNavigationAction
                    key={route.path}
                    label={route.title}
                    icon={<route.icon />}
                    onClick={() => {
                      setSlideDirection(
                        index + leftRoutes.length > currIndex ? 1 : -1
                      )
                      navigate(route.path)
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
        title={modalType === modalTypes.search ? 'Search' : 'Scan'}
        onSave={() => {}}
        type={modalType === modalTypes.search ? 'full' : 'half'}
      />
    </>
  )
}
