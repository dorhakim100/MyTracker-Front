import { useState } from 'react'
import { Card, Typography } from '@mui/material'
import { Macros } from '../Macros/Macros'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { showErrorMsg } from '../../services/event-bus.service'
import { User } from '../../types/user/User'
import { setIsLoading } from '../../store/actions/system.actions'
import { MacrosDistributionEdit } from './MacrosDistributionEdit'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { goalService } from '../../services/goal/goal.service'

interface MacrosDistributionProps {
  protein: number
  carbs: number
  fats: number
  hideEditAndHeader?: boolean
  className?: string
}

export const proteinColor = 'var(--macro-protein)'
export const carbsColor = 'var(--macro-carbs)'
export const fatsColor = 'var(--macro-fats)'

export function MacrosDistribution({
  protein,
  carbs,
  fats,
  hideEditAndHeader = false,
  className = '',
}: MacrosDistributionProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const [open, setOpen] = useState(false)
  const onClose = () => {
    setOpen(false)
  }

  const edit = () => {
    setOpen(true)
  }

  const onSave = async () => {
    try {
      if (!userToEdit || !user) return
      setIsLoading(true)
      optimisticUpdateUser(userToEdit)
      onClose()
      const savedGoal = await goalService.save({ ...userToEdit.currGoal })
      await updateUser({ ...userToEdit, currGoal: savedGoal })
      showSuccessMsg(messages.success.updateMacros)
    } catch (err) {
      showErrorMsg(messages.error.updateMacros)
      optimisticUpdateUser(user as User)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card
        className={`card macros-distribution ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${className}`}
      >
        {!hideEditAndHeader && (
          <Typography variant="h6">Distribution</Typography>
        )}
        {!hideEditAndHeader && <EditIcon onClick={edit} />}
        <MacrosDonut protein={protein} carbs={carbs} fats={fats} />

        <Macros protein={protein} carbs={carbs} fats={fats} />
      </Card>
      <SlideDialog
        open={open}
        onClose={onClose}
        component={
          <MacrosDistributionEdit onCancel={onClose} onSave={onSave} />
        }
        onSave={onSave}
      />
    </>
  )
}
