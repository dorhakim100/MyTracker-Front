import { storageService } from '../async-storage.service'
// import { itemService } from '../item/item.service'
import { User } from '../../types/user/User'
import { UserCred } from '../../types/userCred/UserCred'

const STORAGE_KEY_LOGGEDIN_USER = 'user'
const STORAGE_KEY_REMEMBERED_USER = 'rememberedUser'

export const userService = {
  login,
  logout,
  signup,
  getUsers,
  getById,
  remove,
  update,
  getLoggedinUser,
  saveLoggedinUser,
  getEmptyUser,
  saveRememberedUser,
  getRememberedUser,
}

async function getUsers() {
  try {
    const users = await storageService.query('user')
    return users.map((user: User) => {
      delete user.password
      return user
    })
  } catch (err) {
    throw err
  }
}

async function getById(userId: string) {
  try {
    return await storageService.get('user', userId)
  } catch (err) {
    throw err
  }
}

async function remove(userId: string) {
  try {
   return await storageService.remove('user', userId)
  } catch (err) {
    throw err
  }
}

async function update(userToUpdate: User) {
  try {
    const { _id } = userToUpdate
    const user = await storageService.get('user', _id)

    const savedUser = await storageService.put('user', userToUpdate)

    // When admin updates other user's details, do not update loggedinUser
    const loggedinUser = getLoggedinUser()
    if (loggedinUser._id === user._id) saveLoggedinUser(userToUpdate)

    return savedUser
  } catch (err) {
    throw err
  }
}

async function login(userCred: UserCred) {
  try {
    const users = await storageService.query('user')

    const user = users.find((user: User) => user.email === userCred.email)

    if (user && userCred.email === user.email) {
      if (userCred.isRemember) {
        saveRememberedUser(user)
      }

      return saveLoggedinUser(user)
    } else {
      const err = new Error('User credentials do not match.')

      throw err
    }
  } catch (err) {
    throw err
  }
}

async function signup(userCred: UserCred) {
  try {
    if (!userCred.imgUrl)
      userCred.imgUrl =
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

    const userToSave = {
      ...userCred,
      currGoal: getDefaultGoal(),
      goals: [getDefaultGoal()],
      loggedToday: getDefaultLoggedToday(),
      favoriteItems: {
        food: [],
        product: [],
      },
      weightLogs: [],
    }

    const user = await storageService.post('user', userToSave)
    if (userCred.isRemember) {
      saveRememberedUser(user)
    }

    return saveLoggedinUser(user)
  } catch (err) {
    throw err
  }
}

async function logout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  } catch (err) {
    throw err
  }
}

function getLoggedinUser() {
  try {
    const stringUser = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
    if (!stringUser) return null
    const user = JSON.parse(stringUser)
    if (!user) return null
    return user
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
      goals: user.goals,
      email: user.email,
      loggedToday: user.loggedToday,
      favoriteItems: user.favoriteItems,
      meals: user.meals,
      weights: user.weights,
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
  } catch (err) {
    throw err
  }
}

function saveRememberedUser(user: User) {
  try {
    localStorage.setItem(STORAGE_KEY_REMEMBERED_USER, user._id)
  } catch (err) {
    throw err
  }
}

async function getRememberedUser() {
  try {
    const rememberedId = localStorage.getItem(STORAGE_KEY_REMEMBERED_USER)

    if (!rememberedId) return

    if (rememberedId) {
      const user = await getById(rememberedId)

      if (user) return saveLoggedinUser(user)
    } else {
      throw new Error('No userId found in prefs')
      return null
    }
  } catch (err) {
    throw err
  }
}

function getEmptyUser() {
  return {
    email: '',
    password: '',
    fullname: '',
    imgUrl: '',
    goals: [],
    currGoalId: '',
    loggedToday: getDefaultLoggedToday(),
    favoriteItems: {
      foods: [],
      products: [],
    },
    weightLogs: [],
  }
}

function getDefaultGoal() {
  return {
    _id: 'defaultGoal',
    isSelected: true,
    updatedAt: new Date(),
    title: 'My Goal',
    dailyCalories: 2400,
    macros: {
      protein: 180,
      carbs: 300,
      fat: 53,
    },
  }
}

function getDefaultLoggedToday() {
  return {
    date: new Date().toISOString(),
    calories: 0,
    logs: [],
  }
}
