import axios from 'axios'

export const exerciseSearch = async (query: string) => {
  const url = 'https://www.exercisedb.dev/api/v1/exercises/search'

  const { data } = await axios.get(url, {
    params: { q: query },
  })

  return data
}

const WGER_BASE_URL = 'https://wger.de/api/v2'

export const fetchMuscles = async () => {
  const res = await fetch(`${WGER_BASE_URL}/muscle/`)
  if (!res.ok) throw new Error('Failed to fetch muscles')

  const data = await res.json()
  // data.results is an array of muscles
  console.log(data)
  return data
}
