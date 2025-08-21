import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'

import { ItemFilter } from '../../types/itemFilter/ItemFilter'
import { Item } from '../../types/item/Item'

const STORAGE_KEY = 'item'
const PAGE_SIZE = 20

export const gameService = {
  query,
  getById,
  remove,
  getEmptyItem,
  getDefaultFilter,
  getMaxPage,
}
// window.cs = gameService

// if (!localStorage.getGame(STORAGE_KEY)) {
//   _createGames()
// }

async function query(
  filterBy: ItemFilter = { txt: '', sortDir: 0, pageIdx: 0, isAll: false }
): Promise<Item[]> {
  try {
    let items: Item[] = await storageService.query(STORAGE_KEY)
    const { txt, sortDir, pageIdx, isAll } = filterBy

    if (isAll) return items

    if (txt) {
      const regex = new RegExp(filterBy.txt, 'i')
      items = items.filter((item: Item) => regex.test(item.name))
    }

    if (sortDir) {
      items.sort(
        (a: Item, b: Item) => a.name.localeCompare(b.name) * (sortDir as number)
      )
    }

    if (pageIdx !== undefined) {
      const startIdx = pageIdx * PAGE_SIZE
      items = items.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return items
  } catch (err: Error | any) {
    // // console.log('Had issues, reverting to demo data', err)
    throw err
  }
}

function getById(itemId: string): Promise<any> {
  try {
    return storageService.get(STORAGE_KEY, itemId)
  } catch (error: Error | any) {
    // // console.log('Had issues, reverting to demo data', error)
    throw error
  }
}

async function remove(itemId: string) {
  // throw new Error('Nope')
  try {
    await storageService.remove(STORAGE_KEY, itemId)
  } catch (error: Error | any) {
    // // console.log('Had issues, reverting to demo data', error)
    throw error
  }
}

// async function save(game:Game) {
//   try {
//      var savedGame
//   if (game._id) {
//     const gameToSave = {
//       _id: game._id,
//       title: game.title,

//     }
//     savedGame = await storageService.put(STORAGE_KEY, gameToSave)
//   } else {
//     const gameToSave = {
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729010361/cropping_j9auka.webp',
//       preview: game.preview,
//       price: game.price,
//       stockQuantity: game.stockQuantity,
//       title: game.title,
//       types: [],
//     }
//     savedGame = await storageService.post(STORAGE_KEY, gameToSave)
//   }
//   return savedGame
//   } catch (error:Error | any) {
//     // // console.log('Had issues, reverting to demo data', error)
//     throw error

//   }

// }

function getEmptyItem(): Item {
  return {
    _id: makeId(),
    name: '',
    image: '',
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  }
}

function getDefaultFilter(): ItemFilter {
  return {
    txt: '',
    sortDir: 1,
    pageIdx: 0,
    isAll: false,
  }
}

async function getMaxPage(filterBy: ItemFilter): Promise<any> {
  try {
    var items = await query({ ...filterBy, isAll: true })
    let maxPage = items.length / PAGE_SIZE
    maxPage = Math.ceil(maxPage)
    return maxPage
  } catch (err) {
    // // console.log(err)
  }
}

// function _createGames() {
//   const games = [
//     {
//       _id: makeId(),
//       title: {
//         he: 'כרטיסייה - כל השבוע',
//         eng: '12 Passes - All Week',
//       },
//       preview: {
//         he: '12 ביקורים במחיר מוזל',
//         eng: 'Visit us 12 times, discount price',
//       },
//       price: 800,
//       types: ['card'],
//       stockQuantity: true,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002831/picture_mz9ke7.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'כרטיסייה - אמצע השבוע',
//         eng: '12 Passes - Sunday-Thursday',
//       },
//       preview: {
//         he: '12 ביקורים במחיר מוזל',
//         eng: 'Visit us 12 times, discount price',
//       },
//       price: 600,
//       types: ['card'],
//       stockQuantity: true,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002473/20_rjsrgf.jpg',
//     },

//     {
//       _id: makeId(),
//       title: {
//         he: 'כובע ים',
//         eng: 'Swimming Cap',
//       },
//       preview: {
//         he: 'מתאים למבוגרים ולילדים',
//         eng: 'Suits adults and children',
//       },
//       price: 20,
//       types: ['accessories'],
//       stockQuantity: 30,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002558/HPIM0594_g0hqlu.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'משקפת שחייה',
//         eng: 'Swimming Goggles',
//       },
//       preview: {
//         he: 'מתאים למבוגרים ולילדים',
//         eng: 'Suits adults and children',
//       },
//       price: 40,
//       types: ['accessories'],
//       stockQuantity: 25,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002533/45_shdnag.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'מצופים - 3-6',
//         eng: 'Floats - 3-6',
//       },
//       preview: {
//         he: 'מתאים לגילאי 3-6',
//         eng: 'Suits children ages 3-6',
//       },
//       price: 40,
//       types: ['accessories'],
//       stockQuantity: 21,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002559/HPIM0347_vdpqdu.jpg',
//     },
//     {
//       _id: makeId(),
//       title: {
//         he: 'מצופים - 6-12',
//         eng: 'Floats - 6-12',
//       },
//       preview: {
//         he: 'מתאים לגילאי 6-12',
//         eng: 'Suits children ages 6-12',
//       },
//       price: 40,
//       types: ['accessories'],
//       stockQuantity: 13,
//       cover:
//         'https://res.cloudinary.com/dnxi70mfs/image/upload/v1729002831/picture_mz9ke7.jpg',
//     },
//   ]
//   localStorage.setGame(STORAGE_KEY, JSON.stringify(games))
// }
