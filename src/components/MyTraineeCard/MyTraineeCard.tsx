import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'

import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { User } from '../../types/user/User'
import { Divider } from '@mui/material'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { userService } from '../../services/user/user.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { messages } from '../../assets/config/messages'
import { showErrorMsg } from '../../services/event-bus.service'
import AddIcon from '@mui/icons-material/Add'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

export function MyTraineeCard() {
  const user = useSelector((state: RootState) => state.userModule.user)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [trainees, setTrainees] = useState<User[]>(user?.trainees ?? [])

  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    if (search) {
      onSearchTrainee()
    }
  }, [search])

  async function onSearchTrainee() {
    try {
      setIsLoading(true)
      console.log('search:', search)
      const trainees = await userService.getUsers({
        txt: search,
      })
      setTrainees(trainees)
    } catch (error) {
      showErrorMsg(messages.error.findUser)
    } finally {
      setIsLoading(false)
    }
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
        items={trainees}
        renderPrimaryText={(trainee) => trainee.details.fullname}
        renderSecondaryText={(trainee) => trainee.email}
        renderLeft={(trainee) => (
          <img src={trainee.details.imgUrl} alt={trainee.details.fullname} />
        )}
        getKey={(trainee) => `${trainee._id}-trainee-card`}
        noResultsMessage='No trainees found'
        className={`trainees-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        renderRight={() => <CustomButton icon={<AddIcon />} />}
      />
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <CustomList
        items={user?.trainees ?? []}
        renderPrimaryText={(trainee) => trainee.details.fullname}
        renderSecondaryText={(trainee) => trainee.email}
        renderLeft={(trainee) => (
          <img src={trainee.details.imgUrl} alt={trainee.details.fullname} />
        )}
        getKey={(trainee) => `${trainee._id}-trainee-card`}
        noResultsMessage='No assigned trainees yet'
        className={`trainees-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      />
    </div>
  )
}
