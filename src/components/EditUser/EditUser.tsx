import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { uploadService } from '../../services/upload.service'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { messages } from '../../assets/config/messages'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { getArrayOfNumbers } from '../../services/util.service'
import { CustomToggle } from '../../CustomMui/CustomToggle/CustomToggle'
import { genderOptions } from '../helpers/GenderOptions'
import { ActivityLevel, Gender } from '../../services/bmr/bmr.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { activityOptions } from '../BmrCard/BmrCard'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { deleteAccount } from '../../store/actions/user.actions'
import { logout } from '../../store/actions/user.actions'
import { DeleteAccountCard } from '../DeleteAccountCard/DeleteAccountCard'

interface EditUserProps {
  selectedUser?: User | null
  onSave: (user: User) => void
}

const DEFAULT_BIRTHDATE = 951955200000
const DEFAULT_HEIGHT = 170
const DEFAULT_IMG_URL =
  'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
const DEFAULT_GENDER = 'male'
const DEFAULT_ACTIVITY_LEVEL = 'sedentary'

export function EditUser({ selectedUser, onSave }: EditUserProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  // Local form model keeping only editable fields; merged on save
  const [fullname, setFullname] = useState<string>(
    selectedUser?.details?.fullname || user?.details?.fullname || ''
  )
  const [birthdate, setBirthdate] = useState<number>(
    selectedUser?.details?.birthdate ||
      user?.details?.birthdate ||
      DEFAULT_BIRTHDATE
  )

  const [height, setHeight] = useState<number>(
    selectedUser?.details?.height || user?.details?.height || DEFAULT_HEIGHT
  )
  const [gender, setGender] = useState<string>(
    selectedUser?.details?.gender || user?.details?.gender || DEFAULT_GENDER
  )
  const [imgUrl, setImgUrl] = useState<string>(
    selectedUser?.details?.imgUrl || user?.details?.imgUrl || DEFAULT_IMG_URL
  )
  const [activity, setActivity] = useState(
    selectedUser?.details?.activity ||
      user?.details?.activity ||
      DEFAULT_ACTIVITY_LEVEL
  )
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  const inputs = [
    {
      label: 'Image',
      type: 'image',
      key: 'imgUrl',
      className: 'field',
      value: imgUrl,
      onChange: setImgUrl,
    },
    {
      label: 'Fullname',
      value: fullname,
      onChange: setFullname,

      type: 'text',
      key: 'fullname',
      className: 'field',
    },
    {
      label: 'Birthdate',
      type: 'date',
      key: 'birthdate',
      className: 'field',
      value: birthdate,
      onChange: setIsoDate,
    },
    {
      label: 'Height',
      type: 'select',
      key: 'height',
      className: 'field',
      value: height,
      onChange: (value: string) => setHeight(+value),
    },
    {
      label: 'Gender',
      type: 'toggle',
      key: 'gender',
      options: genderOptions,
      className: 'field',
      value: gender,
      onChange: (value: string) => setGender(value),
    },
    {
      label: 'Activity',
      options: activityOptions,
      onChange: (val: string) => setActivity(val as ActivityLevel),
      type: 'toggle',
      key: 'activity',
      className: 'full-width',
      value: activity,
      extraLabel: 'Activity level',
    },
  ]

  const isoDate = useMemo(() => {
    return new Date(birthdate).toLocaleDateString('he')
  }, [birthdate])

  async function onPickImg(ev: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!ev.target.files || !ev.target.files.length) return

      setIsLoading(true)
      const res = await uploadService.uploadImg(ev)

      if (res && res.secure_url) setImgUrl(res.secure_url)
    } catch (err) {
      showErrorMsg(messages.error.uploadImg)
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSave() {
    if (!selectedUser && !user) return showErrorMsg(messages.error.updateUser)

    const base: User = selectedUser || (user as User)

    const merged: User = {
      ...base,
      details: {
        ...base.details,
        fullname,
        birthdate,
        height,
        gender: gender as Gender,
        imgUrl,
        activity,
      },
    }

    onSave(merged)
  }

  function setIsoDate(isoDate: string) {
    setBirthdate(new Date(isoDate).getTime())
  }

  const setDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
  }

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true)
  }

  const onDeleteAccount = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      await deleteAccount(user)
      setIsDeleteModalOpen(false)

      await logout()
      showSuccessMsg(messages.success.deleteAccount)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.deleteAccount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='edit-user-container'>
        <div className='form-grid'>
          {inputs.map((input) => {
            if (input.type === 'image')
              return (
                <div
                  key={`${input.key}-edit-user`}
                  className='avatar-field-container'
                >
                  <div className='avatar-field'>
                    <div className='image-preview box-shadow white-outline'>
                      {input.value ? (
                        <img src={input.value as string} alt='avatar' />
                      ) : (
                        <div className='placeholder'>No image</div>
                      )}
                    </div>
                    <label
                      className={`upload-button ${
                        prefs.isDarkMode ? 'dark-mode' : ''
                      }`}
                    >
                      <input
                        type='file'
                        accept='image/*'
                        onChange={onPickImg}
                      />
                      {isLoading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                  <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  />
                </div>
              )
            if (input.type === 'text')
              return (
                <CustomInput
                  key={`${input.key}-edit-user`}
                  value={input.value + ''}
                  onChange={input.onChange as (value: string) => void}
                  placeholder={input.label}
                  className={`${input.className} ${prefs.favoriteColor}`}
                />
              )
            if (input.type === 'select')
              return (
                <CustomSelect
                  key={`${input.key}-edit-user`}
                  label={input.label}
                  values={getArrayOfNumbers(100, 250, true) as string[]}
                  value={input.value + ''}
                  onChange={input.onChange}
                  extra='cm'
                />
              )
            if (input.type === 'date')
              return (
                <div className='date-container' key={`${input.key}-edit-user`}>
                  <Typography variant='body1'>
                    {input.label}: {isoDate}
                  </Typography>

                  <CustomDatePicker
                    value={isoDate}
                    onChange={setIsoDate}
                    className={`field ${prefs.favoriteColor}`}
                  />
                </div>
              )
            if (input.type === 'toggle' && input.options)
              return (
                <div
                  key={`${input.key}-edit-user`}
                  className={`${input.className}-container`}
                >
                  {input.extraLabel && (
                    <Typography variant='h6'>{input.extraLabel}</Typography>
                  )}
                  <CustomToggle
                    options={input.options}
                    value={input.value as string}
                    onChange={input.onChange}
                  />
                </div>
              )
          })}
        </div>

        <div className='buttons-container'>
          <div className='save-button-container'>
            <CustomButton text='Save' onClick={handleSave} fullWidth />
          </div>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />

          <CustomButton
            fullWidth
            onClick={openDeleteModal}
            className={`delete-account-button ${prefs.favoriteColor}`}
            text='Delete Account'
          />
        </div>
      </div>
      <CustomAlertDialog
        open={isDeleteModalOpen}
        onClose={setDeleteModalClose}
        title='Delete Account'
      >
        <DeleteAccountCard
          onDeleteAccount={onDeleteAccount}
          setDeleteModalClose={setDeleteModalClose}
        />
      </CustomAlertDialog>
    </>
  )
}
