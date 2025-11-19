import { useState } from 'react'
import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { musclesGroup } from '../../../assets/config/muscles-group'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { EditWorkout } from '../EditWorkout/EditWorkout'

export function Workouts() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="page-container workouts-container">
        {/* {musclesGroup.map((muscleGroup) => (
        <div key={muscleGroup.name}>
        <MuscleGroupCard muscleGroup={muscleGroup} />
        </div>
        ))} */}
        <CustomButton text="Create Workout" onClick={() => setOpen(true)} />
      </div>
      <SlideDialog
        open={open}
        onClose={() => setOpen(false)}
        component={<EditWorkout saveWorkout={() => {}} />}
        title="Create Workout"
        type="full"
      />
    </>
  )
}
