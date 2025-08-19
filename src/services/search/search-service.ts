import axios from 'axios'

const API_URL = 'https://world.openfoodfacts.org/api/v2/search'

const PAGE = 1
const SIZE = 10
const FIELDS =
  'product_name,brands,code,serving_size,nutriments,image_small_url'
const LC = 'he'
const CC = 'il'

export const searchService = {
  search,
}

async function search(query: string) {
  try {
    const response = await axios.get(`${API_URL}?q=${query}
            &page=${PAGE}
            &page_size=${SIZE}
            &fields=${FIELDS}
            &lc=${LC}
            &cc=${CC}`)
    console.log(response.data)
    return response.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
