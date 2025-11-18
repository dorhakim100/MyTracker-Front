import { useEffect } from 'react'
import { exerciseSearch } from '../../../services/exersice-search/exersice-search'

export function Workout() {
  useEffect(() => {
    const fetchExercises = async () => {
      const data = await exerciseSearch('bench press')
      console.log(data)
    }
    fetchExercises()
  }, [])
  return (
    <div>
      <h1>Lift Mate Dashboard</h1>
    </div>
  )
}
