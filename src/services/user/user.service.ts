import { httpService } from '../http.service'
import { indexedDbService } from '../indexeddb.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'
const STORAGE_KEY_REMEMBERED_USER = 'rememberedUser'
const REMEMBER_STORE = 'remember'
const REMEMBER_RECORD_ID = STORAGE_KEY_REMEMBERED_USER

import { User } from '../../types/user/User'
import { UserCred } from '../../types/userCred/UserCred'
import { UserFilter } from '../../types/userFilter/UserFilter'
// import { getPrefs, setPrefs } from '../system/system.service'

export const userService = {
  login,
  logout,
  signup,
  getUsers,
  getById,
  remove,
  update,
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
    // console.log(err)
    throw err
  }
}

async function getById(userId: string) {
  try {
    const user = await httpService.get(`user/${userId}`, null)
    return user
  } catch (err) {
    // console.log(err)
    throw err
  }
}
async function getRememberedById(userId: string) {
  try {
    const user = await httpService.get(`user/remember/${userId}`, null)
    return user
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function remove(userId: string) {
  try {
    return await httpService.delete(`user/${userId}`, null)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function update(user: User) {
  try {
    const { _id } = user

    const savedUser = await httpService.put(`user/${_id}`, user)
    // When admin updates other user's details, do not update loggedinUser
    // console.log(savedUser)
    // return

    await getLoggedinUser() // Might not work because its defined in the main service???
    // const loggedinUser = await getLoggedinUser() // Might not work because its defined in the main service???

    // if (loggedinUser.id === user.id) saveLoggedinUser(savedUser)

    delete savedUser.password
    return savedUser
    // return saveLoggedinUser(savedUser)
  } catch (err) {
    console.log(err)
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

    return saveLoggedinUser(user)
  } catch (err) {
    console.log(err)
    throw err
  }
}

async function signup(userCred: UserCred) {
  try {
    if (!userCred.imgUrl)
      userCred.imgUrl =
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

    const user = await httpService.post('auth/signup', userCred)

    if (userCred.isRemember) {
      saveRememberedUser(user)
    }

    return saveLoggedinUser(user)
  } catch (err) {
    // console.log(err)
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
    // console.log(err)
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
    // console.log(err)
    throw err
  }
}
function saveLoggedinUser(user: User) {
  try {
    user = {
      _id: user._id,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      currGoal: user.currGoal,
      goals: user.goals,
      email: user.email,
      loggedToday: user.loggedToday,
      favoriteItems: user.favoriteItems,
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
  } catch (err) {
    // console.log(err)
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
  }
}

function getDefaultFilter() {
  return {
    txt: '',
  }
}

// async function getRememberedById(userId: string) {
//   try {
//     const user = await httpService.get(`user/rememberMe/${userId}`, null)
//     return user
//   } catch (err) {
//     // console.log(err)
//     throw err
//   }
// }
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
    // console.log(err)
    throw err
  }
}

// async function getMaxPage(filter: UserFilter) {
//   const PAGE_SIZE = 6
//   try {
//     var maxPage = await getUsers({ ...filter, isAll: true, isMax: true })

//     // let maxPage = messages.length / PAGE_SIZE
//     // maxPage = Math.ceil(maxPage)

//     return maxPage
//   } catch (err) {
//     // console.log(err)
//     throw err
//   }
// }

async function saveRememberedUser(user: User) {
  try {
    await indexedDbService.put(REMEMBER_STORE, {
      _id: REMEMBER_RECORD_ID,
      userId: user._id,
    })
  } catch (err) {
    // console.log(err)
    throw err
  }
}
