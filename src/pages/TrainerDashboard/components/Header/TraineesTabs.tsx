import { Tab, Tabs } from '@mui/material'
import { User } from '../../../../types/user/User'
import { setTraineeUser } from '../../../../store/actions/user.actions'
import { useMemo } from 'react'
import { RootState } from '../../../../store/store'
import { useSelector } from 'react-redux'


import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DragStart,
} from '@hello-pangea/dnd'

interface TraineesTabsProps {
  trainees: User[]

}

export function TraineesTabs({ trainees }: TraineesTabsProps) {

  const traineeUser = useSelector((state: RootState) => state.userModule.traineeUser)

  const selectedTabIndex = useMemo(() => {
    if (!traineeUser || trainees.length === 0) return 0
    const index = trainees.findIndex((t) => t._id === traineeUser._id)
    return index >= 0 ? index : 0
  }, [traineeUser, trainees])
  return <Tabs
    value={selectedTabIndex}
    onChange={(_event, newValue) => {
      if (trainees[newValue]) {
        setTraineeUser(trainees[newValue])
      }
    }}
    textColor="inherit"
  >


    {trainees.map((trainee) => (
      <Tab key={trainee._id} label={trainee.details.fullname} />
    ))}
  </Tabs>
}