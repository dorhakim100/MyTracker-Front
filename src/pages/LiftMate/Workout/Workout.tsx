import { useEffect } from 'react'
import {
  exerciseSearch,
  fetchMuscles,
} from '../../../services/exersice-search/exersice-search'

export function Workout() {
  useEffect(() => {
    const fetchExercises = async () => {
      const data = await exerciseSearch('bench press')
      console.log(data)
    }
    fetchExercises()
    const fetchMusclesData = async () => {
      const data = await fetchMuscles()
      console.log(data)
    }
    fetchMusclesData()
  }, [])
  return (
    <div>
      <h1>Lift Mate Dashboard</h1>
    </div>
  )
}
