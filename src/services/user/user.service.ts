import { httpService } from '../http.service'
import { indexedDbService } from '../indexeddb.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'
const STORAGE_KEY_REMEMBERED_USER = 'rememberedUser'
const REMEMBER_STORE = 'remember'
const REMEMBER_RECORD_ID = STORAGE_KEY_REMEMBERED_USER

import { User, UserDetails } from '../../types/user/User'
import { UserCred } from '../../types/userCred/UserCred'
import { UserFilter } from '../../types/userFilter/UserFilter'
import { searchService } from '../search/search-service'
import { setFavoriteItems } from '../../store/actions/item.actions'
import { Gender } from '../bmr/bmr.service'
import { MealItem } from '../../types/mealItem/MealItem'
import { Meal } from '../../types/meal/Meal'
import { searchTypes } from '../../assets/config/search-types'
import {
  APPROVED_STATUS,
  REJECTED_STATUS,
} from '../../assets/config/request-statuses'
// import { getPrefs, setPrefs } from '../system/system.service'

export const userService = {
  login,
  logout,
  signup,
  getUsers,
  getById,
  remove,
  update,
  requestTrainee,
  getRequests,
  updateRequest,
  getLoggedinUser,
  getDefaultFilter,
  saveLoggedinUser,
  getEmptyUser,
  getRememberedById,
  getRememberedUser,
  // getMaxPage,
}

async function getUsers(filter: UserFilter) {
  try {
    const users = await httpService.get(`user`, filter)

    return users
  } catch (err) {
    throw err
  }
}

async function getById(userId: string) {
  try {
    const user = await httpService.get(`user/${userId}`, null)
    return user
  } catch (err) {
    throw err
  }
}
async function getRememberedById(userId: string) {
  try {
    const user = await httpService.get(`user/remember/${userId}`, null)

    return user
  } catch (err) {
    throw err
  }
}

async function remove(userId: string) {
  try {
    return await httpService.delete(`user/${userId}`, null)
  } catch (err) {
    throw err
  }
}

async function update(user: User) {
  try {
    const { _id } = user

    const mealsIds = user.meals.map((meal) => meal._id)
    const goalsIds = user.goals.map((goal) => goal._id)
    // const weightsIds = user.weights.map((weight) => weight._id)
    const userToSend = {
      _id: user._id,
      details: user.details,
      email: user.email,
      favoriteItems: user.favoriteItems,
      lastWeight: user.lastWeight,
      loggedToday: user.loggedToday,

      mealsIds,
      goalsIds,
    }

    const savedUser = await httpService.put(`user/${_id}`, userToSend)

    await getLoggedinUser() // Might not work because its defined in the main service???

    delete savedUser.password
    return savedUser
  } catch (err) {
    throw err
  }
}

async function requestTrainee(request: { trainer: string; trainee: string }) {
  try {
    return await httpService.post(`trainer-request`, request)
  } catch (err) {
    throw err
  }
}

async function getRequests(trainerId?: string, traineeId?: string) {
  try {
    if (traineeId) {
      return await httpService.get(`trainer-request/trainee/${traineeId}`, null)
    }
    return await httpService.get(`trainer-request/trainer/${trainerId}`, null)
  } catch (err) {
    throw err
  }
}

async function updateRequest(
  requestId: string,
  status: typeof APPROVED_STATUS | typeof REJECTED_STATUS
) {
  try {
    return await httpService.put(`trainer-request/${requestId}/${status}`, null)
  } catch (err) {
    throw err
  }
}
async function login(userCred: UserCred) {
  try {
    const user = await httpService.post('auth/login', userCred)

    if (!user) {
      const err = new Error('User credentials do not match.')

      throw err
    }
    if (userCred.isRemember) {
      saveRememberedUser(user)
    }

    const favoriteIDs = user.favoriteItems
    // Get cached results immediately and set them
    const cachedItems = await searchService.searchFavoriteItems(
      favoriteIDs,
      // Callback when background fetch completes
      (completeItems) => {
        setFavoriteItems(completeItems)
      }
    )

    // Set cached items immediately (user can see them right away)
    setFavoriteItems(cachedItems)

    const LONGEST_FOOD_ID_LENGTH = 10

    user.meals.forEach((meal: Meal) => {
      meal.items.forEach((item: MealItem) => {
        if (!item.searchId) return
        const source =
          item.searchId.length < LONGEST_FOOD_ID_LENGTH
            ? searchTypes.usda
            : searchTypes.openFoodFacts
        searchService.searchById(item.searchId, source)
      })
    })

    return saveLoggedinUser(user)
  } catch (err) {
    throw err
  }
}

async function signup(userCred: UserCred) {
  try {
    const DEFAULT_IMG_URL =
      'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
    const DEFAULT_BIRTHDATE = 951955200000
    const DEFAULT_HEIGHT = 170

    const userDetails: UserDetails = {
      fullname: userCred.fullname || '',
      birthdate: DEFAULT_BIRTHDATE,
      height: DEFAULT_HEIGHT,
      gender: userCred?.details?.gender || ('male' as Gender),
      imgUrl: userCred.imgUrl || DEFAULT_IMG_URL,
      activity: 'sedentary',
    }

    userCred.details = userDetails

    const user = await httpService.post('auth/signup', userCred)

    if (userCred.isRemember) {
      saveRememberedUser(user)
    }

    return saveLoggedinUser(user)
  } catch (err) {
    throw err
  }
}

async function logout() {
  sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  try {
    await indexedDbService.remove(REMEMBER_STORE, REMEMBER_RECORD_ID)
  } catch {}
  try {
    return await httpService.post('auth/logout', null)
  } catch (err) {
    throw err
  }
}

async function getLoggedinUser(): Promise<User | null> {
  try {
    const remembered = await getRememberedUser()

    if (!remembered) {
      const sessionStr = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)

      if (!sessionStr) return null
      const logged = JSON.parse(sessionStr)
      if (!logged) return null

      const retrieved = await getById(logged._id)

      saveLoggedinUser(retrieved)
      return retrieved
    }
    saveLoggedinUser(remembered)
    return remembered
  } catch (err) {
    throw err
  }
}
function saveLoggedinUser(user: User) {
  try {
    user = {
      _id: user._id,
      details: user.details,
      currGoal: user.currGoal,
      goals: user.goals ?? [],
      email: user.email,
      loggedToday: user.loggedToday,
      favoriteItems: user.favoriteItems ?? [],
      meals: user.meals ?? [],
      lastWeight: user.lastWeight,
      isTrainer: user.isTrainer,
      trainees: user.trainees ?? [],
      // weights: user.weights ?? [],
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
  } catch (err) {
    throw err
  }
}

function getEmptyUser() {
  return {
    id: '',
    password: '',
    fullname: '',
    email: '',
    imgUrl: '',
    weightLogs: [],
  }
}

function getDefaultFilter() {
  return {
    txt: '',
  }
}

async function getRememberedUser() {
  try {
    let rememberedId: string | null = null

    try {
      const rec = await indexedDbService.get<{ _id?: string; userId?: string }>(
        REMEMBER_STORE,
        REMEMBER_RECORD_ID
      )
      if (rec && rec.userId) rememberedId = rec.userId
    } catch {}

    if (!rememberedId) {
      const ls = localStorage.getItem(STORAGE_KEY_REMEMBERED_USER)
      if (ls) {
        rememberedId = ls
        try {
          await indexedDbService.put(REMEMBER_STORE, {
            _id: REMEMBER_RECORD_ID,
            userId: rememberedId,
          })
          localStorage.removeItem(STORAGE_KEY_REMEMBERED_USER)
        } catch {}
      }
    }

    if (!rememberedId) return

    const user = await getRememberedById(rememberedId)

    if (user) return saveLoggedinUser(user)
    return null
  } catch (err) {
    throw err
  }
}

async function saveRememberedUser(user: User) {
  try {
    await indexedDbService.put(REMEMBER_STORE, {
      _id: REMEMBER_RECORD_ID,
      userId: user._id,
    })
  } catch (err) {
    throw err
  }
}
