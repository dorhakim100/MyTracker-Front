import { useState } from 'react'

import { Card, Typography } from '@mui/material'

import { CircularProgress } from '../CircularProgress/CircularProgress'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { EditMacros } from './EditMacros'
import { showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { showErrorMsg } from '../../services/event-bus.service'
import { setIsLoading } from '../../store/actions/system.actions'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { goalService } from '../../services/goal/goal.service'

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

const proteinColorDarkMode = 'var(--macro-protein-dark)'
const carbsColorDarkMode = 'var(--macro-carbs-dark)'
const fatsColorDarkMode = 'var(--macro-fats-dark)'

interface Macro {
  percentage: number
  gram: number
}
interface MacrosProgressProps {
  protein: Macro
  carbs: Macro
  fats: Macro
}

export function MacrosProgress({ protein, carbs, fats }: MacrosProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const [openModal, setOpenModal] = useState(false)

  const macros = [
    {
      name: 'Carbs',
      value: carbs,
      color: prefs.isDarkMode ? carbsColorDarkMode : carbsColor,
    },
    {
      name: 'Protein',
      value: protein,
      color: prefs.isDarkMode ? proteinColorDarkMode : proteinColor,
    },
    {
      name: 'Fats',
      value: fats,
      color: prefs.isDarkMode ? fatsColorDarkMode : fatsColor,
    },
  ]

  const edit = () => {
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  const onSave = async () => {
    try {
      if (!userToEdit) return
      setIsLoading(true)
      optimisticUpdateUser(userToEdit)
      onClose()
      const savedGoal = await goalService.save({ ...userToEdit.currGoal })
      await updateUser({ ...userToEdit, currGoal: savedGoal })
      showSuccessMsg(messages.success.updateMacros)
    } catch (err) {
      showErrorMsg(messages.error.updateMacros)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card
        className={`card macros-progress ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <Typography variant="h6" className="bold-header">
          Macros
        </Typography>
        <EditIcon onClick={edit} />
        <div className="macros-container">
          {macros.map((macro) => (
            <div
              className={`macro-container ${macro.name.toLowerCase()}`}
              key={`progress-${macro.name}`}
            >
              <CircularProgress
                value={macro.value.percentage}
                text={`${macro.value.gram.toFixed(0)}`}
                color={macro.color}
              />
              <span>{macro.name}</span>
              <GoalBanner
                current={(
                  (macro.value.percentage / 100) *
                  macro.value.gram
                ).toFixed(0)}
                goal={macro.value.gram.toFixed(0)}
              />
            </div>
          ))}
        </div>
      </Card>
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={<EditMacros onCancel={onClose} onSave={onSave} />}
        title="Edit Macros"
        onSave={onSave}
      />
    </>
  )
}
