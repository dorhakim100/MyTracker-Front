import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'

import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { User } from '../../types/user/User'
import { Chip, Divider } from '@mui/material'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { userService } from '../../services/user/user.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { messages } from '../../assets/config/messages'
import { showErrorMsg } from '../../services/event-bus.service'
import AddIcon from '@mui/icons-material/Add'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { TrainerRequest } from '../../types/trainerRequest/TrainerRequest'
import { useTranslation } from 'react-i18next'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DisabledVisibleIcon from '@mui/icons-material/DisabledVisible'

import {
  APPROVED_STATUS,
  REJECTED_STATUS,
  PENDING_STATUS,
} from '../../assets/config/request-statuses'
import {
  removeTraineeUser,
  setTraineeUser,
} from '../../store/actions/user.actions'

interface MyTraineeCardProps {
  displayTrainees?: boolean
}

export function MyTraineeCard({ displayTrainees = true }: MyTraineeCardProps) {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )

  const [searchedTrainees, setSearchedTrainees] = useState<User[]>([])
  const [trainees, setTrainees] = useState<User[]>(user?.trainees ?? [])

  const [requests, setRequests] = useState<TrainerRequest[]>([])

  const [search, setSearch] = useState<string>('')

  if (!user) {
    return null
  }

  useEffect(() => {
    if (!search || search === '') {
      setSearchedTrainees([])
      return
    }
    onSearchTrainee()
  }, [search])

  useEffect(() => {
    getRequests()
  }, [user])

  async function onSearchTrainee() {
    try {
      if (!user) {
        return
      }
      setIsLoading(true)
      const trainees = await userService.getUsers({
        txt: search,
        searchingUserId: user._id,
      })
      setSearchedTrainees(trainees)
    } catch (error) {
      showErrorMsg(messages.error.findUser)
    } finally {
      setIsLoading(false)
    }
  }

  async function onAddTrainee(trainee: User) {
    try {
      if (!user) {
        return
      }

      const request = await userService.requestTrainee({
        trainer: user._id,
        trainee: trainee._id,
      })

      setRequests([...requests, request])
    } catch (error) {
      showErrorMsg(messages.error.addTrainee)
    }
  }

  async function getRequests() {
    try {
      if (!user) {
        return
      }
      setIsLoading(true)
      const requests = await userService.getRequests(user._id)

      const requestUsers = requests.map(
        (request: TrainerRequest) => request.trainee
      )

      setTrainees(requestUsers)

      setRequests(requests)
    } catch (err) {
      showErrorMsg(messages.error.getRequests)
    } finally {
      setIsLoading(false)
    }
  }

  const renderRequestStatus = (trainee: User) => {
    const request = requests.find(
      (request) => request.traineeId === trainee._id
    )
    if (!request) {
      return (
        <CustomButton
          icon={<AddIcon />}
          onClick={(ev) => {
            ev.preventDefault()
            onAddTrainee(trainee)
          }}
        />
      )
    }

    switch (request.status) {
      case PENDING_STATUS:
        return <Chip label='Pending' />
      case APPROVED_STATUS:
        if (traineeUser?._id === trainee._id) {
          return (
            <CustomButton
              className='disable-button'
              icon={<DisabledVisibleIcon />}
              onClick={() => {
                removeTraineeUser()
              }}
            />
          )
        } else
          return (
            <CustomButton
              icon={<VisibilityIcon />}
              onClick={() => {
                setTraineeUser(trainee)
              }}
            />
          )
        return <Chip label='Accepted' />
      case REJECTED_STATUS:
        return <Chip label='Rejected' />
    }

    return null
  }

  return (
    <div className='my-trainees-container'>
      <CustomInput
        value={search}
        onChange={setSearch}
        placeholder={t('trainer.searchForTrainee')}
        isRemoveIcon={true}
        className={`${prefs.favoriteColor}`}
      />
      {/* <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} /> */}

      <CustomList
        items={searchedTrainees}
        renderPrimaryText={(trainee) => trainee.details.fullname}
        renderSecondaryText={(trainee) => trainee.email}
        renderLeft={(trainee) => (
          <img
            src={trainee.details.imgUrl}
            alt={trainee.details.fullname}
          />
        )}
        getKey={(trainee) => `${trainee._id}-searched-trainee-card`}
        noResultsMessage={
          search === ''
            ? t('trainer.searchTraineeDescription')
            : t('trainer.noTraineesFound')
        }
        className={`trainees-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        renderRight={(trainee) => renderRequestStatus(trainee)}
      />
      {displayTrainees && (
        <>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />

          <CustomList
            items={trainees ?? []}
            renderPrimaryText={(trainee) => trainee.details.fullname}
            renderSecondaryText={(trainee) => trainee.email}
            renderLeft={(trainee) => (
              <img
                src={trainee.details.imgUrl}
                alt={trainee.details.fullname}
              />
            )}
            renderRight={(trainee) => renderRequestStatus(trainee)}
            getKey={(trainee) => `${trainee._id}-assigned-trainee-card`}
            noResultsMessage={t('trainer.noAssignedTrainees')}
            className={`trainees-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        </>
      )}
    </div>
  )
}
