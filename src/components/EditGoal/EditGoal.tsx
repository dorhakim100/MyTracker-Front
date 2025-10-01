import React from 'react'
import { Goal } from '../../types/goal/Goal'

interface EditGoalProps {
  selectedGoal?: Goal | null
  saveGoal: (goal: Goal) => void
}

export function EditGoal({ selectedGoal, saveGoal }: EditGoalProps) {
  return <div>EditGoal</div>
}
