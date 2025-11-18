import axios from 'axios'

export const exerciseSearch = async (query: string) => {
  const url = 'https://www.exercisedb.dev/api/v1/exercises/search'

  const { data } = await axios.get(url, {
    params: { q: query },
  })

  return data
}
