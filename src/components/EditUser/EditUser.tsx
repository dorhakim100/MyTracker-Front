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
import { showErrorMsg } from '../../services/event-bus.service'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { getArrayOfNumbers } from '../../services/util.service'
import { CustomToggle } from '../../CustomMui/CustomToggle/CustomToggle'
import { genderOptions } from '../helpers/GenderOptions'
import { Gender } from '../../services/bmr/bmr.service'
interface EditUserProps {
  selectedUser?: User | null
  onSave: (user: User) => void
}

const DEFAULT_BIRTHDATE = 951955200000
const DEFAULT_HEIGHT = 170
const DEFAULT_IMG_URL =
  'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
const DEFAULT_GENDER = 'male'

export function EditUser({ selectedUser, onSave }: EditUserProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
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
  const [isUploading, setIsUploading] = useState<boolean>(false)

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
  ]

  const isoDate = useMemo(() => {
    return new Date(birthdate).toLocaleDateString('he')
  }, [birthdate])

  async function onPickImg(ev: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!ev.target.files || !ev.target.files.length) return
      setIsUploading(true)
      const res = await uploadService.uploadImg(ev)
      if (res && res.secure_url) setImgUrl(res.secure_url)
    } catch (err) {
      console.log(err)
    } finally {
      setIsUploading(false)
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
      },
    }

    onSave(merged)
  }

  function setIsoDate(isoDate: string) {
    setBirthdate(new Date(isoDate).getTime())
  }

  return (
    <div className='edit-user-container'>
      <div className='form-grid'>
        {inputs.map((input) => {
          if (input.type === 'image')
            return (
              <>
                <div className='avatar-field' key={`${input.key}-edit-user`}>
                  <div className='image-preview'>
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
                    <input type='file' accept='image/*' onChange={onPickImg} />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
                <Divider
                  className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                />
              </>
            )
          if (input.type === 'text')
            return (
              <CustomInput
                key={`${input.key}-edit-user`}
                value={input.value + ''}
                onChange={input.onChange as (value: string) => void}
                placeholder={input.label}
                className={input.className}
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
                  className='field'
                />
              </div>
            )
          if (input.type === 'toggle' && input.options)
            return (
              <CustomToggle
                key={`${input.key}-edit-user`}
                options={input.options}
                value={input.value as string}
                onChange={input.onChange}
              />
            )
        })}
      </div>

      <div className='save-button-container'>
        <CustomButton text='Save' onClick={handleSave} fullWidth />
      </div>
    </div>
  )
}
