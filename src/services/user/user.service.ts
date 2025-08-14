import { storageService } from '../async-storage.service'
// import { itemService } from '../item/item.service'
import { User } from '../../types/user/User'
import { UserCred } from '../../types/userCred/UserCred'
import { UserFilter } from '../../types/userFilter/UserFilter'

const STORAGE_KEY_LOGGEDIN_USER = 'user'

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
}

async function getUsers(filter: UserFilter) {
  try {
    const users = await storageService.query('user')
    return users.map((user: User) => {
      delete user.password
      return user
    })
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function getById(userId: string) {
  try {
    return await storageService.get('user', userId)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function remove(userId: string) {
  try {
    return await storageService.remove('user', userId)
  } catch (err) {
    // console.log(err)
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
    // console.log(err)
    throw err
  }
}

async function login(userCred: UserCred) {
  try {
    const users = await storageService.query('user')

    const user = users.find((user: User) => user.email === userCred.email)

    if (user && userCred.email === user.email) {
      return saveLoggedinUser(user)
    } else {
      const err = new Error('User credentials do not match.')

      throw err
    }
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function signup(userCred: UserCred) {
  try {
    if (!userCred.imgUrl)
      userCred.imgUrl =
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

    const user = await storageService.post('user', userCred)
    console.log('signup', user)
    return saveLoggedinUser(user)
  } catch (err) {
    // console.log(err)
    throw err
  }
}

async function logout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  } catch (err) {
    // console.log(err)
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
      // isAdmin: user.isAdmin,
      email: user.email,
      // phone: user.phone,
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
    email: '',
    password: '',
    fullname: '',
    imgUrl: '',
    goals: [],
    // isAdmin: false,
  }
}

// To quickly create an admin user, uncomment the next line
// _createAdmin()
async function _createAdmin() {
  try {
    const userCred = {
      email: 'admin@gmail.com',

      password: 'admin123',
      fullname: 'Dor Hakim',
      goals: [],
      imgUrl:
        'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
    }

    const newUser = await storageService.post('user', userCred)
  } catch (err) {
    // console.log(err)
    throw err
  }
}
