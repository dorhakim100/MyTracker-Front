import { useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { User } from '../../types/user/User'
import { userService } from '../../services/user/user.service'
import { uploadService } from '../../services/upload.service'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

interface EditUserProps {
  selectedUser?: User | null
  onSave: (user: User) => void
}

export function EditUser({ selectedUser, onSave }: EditUserProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const loggedUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  // Local form model keeping only editable fields; merged on save
  const [fullname, setFullname] = useState<string>(selectedUser?.fullname || '')
  const [age, setAge] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [imgUrl, setImgUrl] = useState<string>(selectedUser?.imgUrl || '')
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const isSaveDisabled = !fullname

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
    const base: User =
      selectedUser ||
      (userService.getEmptyUser() as unknown as User) ||
      (loggedUser as User)

    const merged: User = {
      ...base,
      fullname,
      // These fields are not currently part of User type, keep as extension
      // @ts-expect-error - transient fields until backend supports them
      age: age ? +age : undefined,
      // @ts-expect-error - transient fields until backend supports them
      height: height ? +height : undefined,
      imgUrl,
    }

    onSave(merged)
  }

  return (
    <div className='edit-user-container'>
      <Typography variant='h6'>Edit User</Typography>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <div className='form-grid'>
        <div className='avatar-field'>
          <div className='image-preview'>
            {imgUrl ? (
              <img src={imgUrl} alt='avatar' />
            ) : (
              <div className='placeholder'>No image</div>
            )}
          </div>
          <label className='upload-button'>
            <input type='file' accept='image/*' onChange={onPickImg} />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </label>
        </div>

        <CustomInput
          value={fullname}
          onChange={setFullname}
          placeholder='Fullname'
          className='field'
        />
        <CustomInput
          value={age}
          onChange={setAge}
          placeholder='Age'
          className='field'
        />
        <CustomInput
          value={height}
          onChange={setHeight}
          placeholder='Height (cm)'
          className='field'
        />
      </div>

      <div className='buttons-row'>
        <CustomButton
          text='Save'
          onClick={handleSave}
          fullWidth
          disabled={isSaveDisabled}
        />
      </div>
    </div>
  )
}
