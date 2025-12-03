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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import {
  APPROVED_STATUS,
  REJECTED_STATUS,
  PENDING_STATUS,
} from '../../assets/config/request-statuses'

export function MyTraineeCard() {
  const user = useSelector((state: RootState) => state.userModule.user)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

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

  useEffect(() => {
    console.log('requests:', requests)
  }, [requests])

  async function onSearchTrainee() {
    try {
      if (!user) {
        return
      }
      setIsLoading(true)
      console.log('search:', search)
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
      console.log(trainee)
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
      console.log('requestUsers:', requestUsers)

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
    console.log('request:', request)

    switch (request.status) {
      case PENDING_STATUS:
        return <Chip label='Pending' />
      case APPROVED_STATUS:
        return <CustomButton icon={<ArrowForwardIcon />} />
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
        placeholder='Search for a trainee'
        isRemoveIcon={true}
      />
      {/* <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} /> */}

      <CustomList
        items={searchedTrainees}
        renderPrimaryText={(trainee) => trainee.details.fullname}
        renderSecondaryText={(trainee) => trainee.email}
        renderLeft={(trainee) => (
          <img src={trainee.details.imgUrl} alt={trainee.details.fullname} />
        )}
        getKey={(trainee) => `${trainee._id}-searched-trainee-card`}
        noResultsMessage='No trainees found'
        className={`trainees-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        renderRight={(trainee) => renderRequestStatus(trainee)}
      />
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <CustomList
        items={trainees ?? []}
        renderPrimaryText={(trainee) => trainee.details.fullname}
        renderSecondaryText={(trainee) => trainee.email}
        renderLeft={(trainee) => (
          <img src={trainee.details.imgUrl} alt={trainee.details.fullname} />
        )}
        renderRight={(trainee) => renderRequestStatus(trainee)}
        getKey={(trainee) => `${trainee._id}-assigned-trainee-card`}
        noResultsMessage='No assigned trainees yet'
        className={`trainees-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      />
    </div>
  )
}
