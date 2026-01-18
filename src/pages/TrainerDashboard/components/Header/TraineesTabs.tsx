import { Tab, Tabs } from '@mui/material'
import { User } from '../../../../types/user/User'
import { setTraineeUser } from '../../../../store/actions/user.actions'
import { useMemo, useState, useEffect } from 'react'
import { RootState } from '../../../../store/store'
import { useSelector } from 'react-redux'


import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import { indexedDbService } from '../../../../services/indexeddb.service'
import { TRAINEE_ORDER_STORE_NAME } from '../../../../constants/store.constants'


interface TraineesTabsProps {
  trainees: User[]

}

export function TraineesTabs({ trainees }: TraineesTabsProps) {

  const traineeUser = useSelector((state: RootState) => state.userModule.traineeUser)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [reorderedTrainees, setReorderedTrainees] = useState<User[]>(trainees)

  useEffect(() => {
    setReorderedTrainees(trainees)
  }, [trainees])

  const selectedTabIndex = useMemo(() => {
    if (!traineeUser || reorderedTrainees.length === 0) return 0
    const index = reorderedTrainees.findIndex((t) => t._id === traineeUser._id)
    return index >= 0 ? index : 0
  }, [traineeUser, reorderedTrainees])

  const onDragEnd = async ({ destination, source }: DropResult) => {
    if (!destination || destination.index === source.index) return

    const newTrainees = [...reorderedTrainees]
    const [moved] = newTrainees.splice(source.index, 1)

    newTrainees.splice(destination.index, 0, moved)
    setReorderedTrainees(newTrainees)
    setTraineeUser(newTrainees[destination.index])

    const traineesOrder = newTrainees.map((trainee) => trainee._id)
    localStorage.setItem(TRAINEE_ORDER_STORE_NAME, JSON.stringify(traineesOrder))
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="trainees-tabs" direction="horizontal">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>

            <Tabs
              ref={provided.innerRef}
              {...provided.droppableProps}
              value={selectedTabIndex}
              onChange={(_event, newValue) => {
                if (reorderedTrainees[newValue]) {
                  setTraineeUser(reorderedTrainees[newValue])
                }
              }}
              textColor="inherit"
            >

              {
                reorderedTrainees.map((trainee, index) => (
                  <Draggable key={trainee._id} draggableId={trainee._id} index={index}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (

                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setTraineeUser(trainee)}
                        className={`trainee-tab ${snapshot.isDragging ? 'dragging' : ''} ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
                        {trainee.details.fullname}
                      </div>

                    )}
                  </Draggable>
                ))
              }

              {provided.placeholder}
            </Tabs>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}