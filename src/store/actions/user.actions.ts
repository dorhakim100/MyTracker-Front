import { store } from '../store'
import { userService } from '../../services/user/user.service'

import {
  SET_USER,
  SET_USERS,
  REMOVE_USER,
  SET_WATCHED_USER,
  SET_USER_TO_EDIT,
  SET_SELECTED_DAY,
  // SET_USER_FILTER,
} from '../reducers/user.reducer'

import { UserFilter } from '../../types/userFilter/UserFilter'
import { UserCred } from '../../types/userCred/UserCred'
import { User } from '../../types/user/User'
import { searchService } from '../../services/search/search-service'
import { Item } from '../../types/item/Item'
import { cache } from '../../assets/config/cache'
import { Log } from '../../types/log/Log'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { dayService } from '../../services/day/day.service'
import { addFavoriteItem, removeFavoriteItem } from './item.actions'
import { mealService } from '../../services/meal/meal.service'
import { Meal } from '../../types/meal/Meal'
import { Gender } from '../../services/bmr/bmr.service'

const { FAVORITE_CACHE } = cache

export async function loadUsers(filter: UserFilter) {
  try {
    // store.dispatch({ type: SET_USER_FILTER, filter })
    const users = await userService.getUsers(filter)
    store.dispatch({ type: SET_USERS, users })
    return users
  } catch (err) {
    // console.log('UserActions: err in loadUsers', err)
    throw err
  }
}

export async function removeUser(userId: string) {
  try {
    await userService.remove(userId)
    store.dispatch({ type: REMOVE_USER, userId })
  } catch (err) {
    // console.log('UserActions: err in removeUser', err)
    throw err
  }
}

export async function login(credentials: UserCred) {
  try {
    await logout()

    const retrived = await userService.login(credentials)

    const user = {
      ...retrived,
      meals: retrived.meals.map((meal: Meal) => mealService.modifyMeal(meal)),
    }

    store.dispatch({
      type: SET_USER,
      user: user,
    })

    setSelectedDiaryDay(user.loggedToday)
    setUserToEdit(user)
    // socketService.login(user._id)
    return user
  } catch (err) {
    // console.log('Cannot login', err)
    throw err
  }
}

export async function handleGuestMode() {
  try {
    await _loginWithGuest()
  } catch (err) {
    throw err
    // console.log(err);
    // showErrorMsg(`Couldn't use guest mode`)
  }
}

async function _loginWithGuest() {
  try {
    const credentials = {
      // id: makeId(),
      fullname: 'Guest',
      password: 'Guest',
      email: 'Guest@guest.com',
      isGuest: true,
      details: {
        fullname: 'Guest',
        birthdate: 951955200000,
        height: 170,
        gender: 'male' as Gender,
        imgUrl:
          'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
      },
    }
    const user = await userService.signup(credentials)

    store.dispatch({
      type: SET_USER,
      user: user,
    })
    // socketService.login(user._id)
    return user
  } catch (err) {
    // console.log('Cannot login', err)
    throw err
  }
}

export async function updateUser(userToUpdate: User) {
  try {
    const saved = await userService.update(userToUpdate)
    console.log('saved', saved)
    store.dispatch({
      type: SET_USER,
      user: saved,
    })

    return saved
  } catch (err) {
    // console.log(err);
    throw err
  }
}

export function optimisticUpdateUser(userToUpdate: User) {
  store.dispatch({
    type: SET_USER,
    user: userToUpdate,
  })
}

export function setUserToEdit(
  userToEdit: User | (User & { meals: Meal[] | string[] }) | null
) {
  store.dispatch({
    type: SET_USER_TO_EDIT,
    userToEdit,
  })
}

export async function signup(credentials: UserCred) {
  try {
    await logout()

    const user = await userService.signup(credentials)
    store.dispatch({
      type: SET_USER,
      user,
    })

    setUserToEdit(user)
    return user

    // if (user && credentials.isRemember) return
    // socketService.login(user._id)
    return user
  } catch (err) {
    // console.log('Cannot signup', err)
    throw err
  }
}

export async function logout() {
  try {
    await userService.logout()
    store.dispatch({
      type: SET_USER,
      user: null,
    })
    setSelectedDiaryDay(null)
    setUserToEdit(null)

    // socketService.logout()
  } catch (err) {
    // console.log('Cannot logout', err)
    throw err
  }
}

export async function loadUser(userId: string) {
  try {
    // debugger
    const user = await userService.getById(userId)

    // store.dispatch({ type: SET_WATCHED_USER, user })
    store.dispatch({ type: SET_WATCHED_USER, user })
    return user
  } catch (err) {
    throw err
    // console.log('Cannot load user', err)
  }
}

export async function handleFavorite(item: Item, user: User) {
  try {
    if (!item.searchId) throw new Error('Item not found')

    let favoriteArray = user.favoriteItems || []

    if (favoriteArray.includes(item.searchId)) {
      favoriteArray = favoriteArray.filter((id: string) => id !== item.searchId)
      await searchService.removeFromCache(item, FAVORITE_CACHE)
      removeFavoriteItem(item)
    } else {
      await searchService.addToCache(item, FAVORITE_CACHE)
      favoriteArray.push(item.searchId)
      addFavoriteItem(item)
    }

    const userToSave = {
      ...user,
      favoriteItems: [...favoriteArray],
    }

    await updateUser(userToSave)
  } catch (err) {
    console.log('err in handleFavorite', err)
    throw err
  }
}

export async function setRemembered() {
  try {
    const remembered = await userService.getRememberedUser()

    if (!remembered) return

    const user = {
      ...remembered,
      meals:
        remembered?.meals.map((meal: Meal) => mealService.modifyMeal(meal)) ||
        [],
    }

    store.dispatch({
      type: SET_USER,
      user,
    })

    setUserToEdit(user as User & { meals: Meal[] | string[] })
  } catch (err) {
    throw err
  }
}

export function removeLogAction(log: Log, loggedToday: LoggedToday) {
  const logs = loggedToday.logs
  if (!logs) throw new Error('No logs found')

  const isSameLog = (l: Log) =>
    (log._id && l._id === log._id) ||
    (l.itemId === log.itemId && l.time === log.time && l.meal === log.meal)

  const newLogs = logs.filter((l) => !isSameLog(l))

  if (newLogs.length === logs.length) throw new Error('No log found')

  const newCalories = newLogs.reduce((acc, lg) => acc + lg.macros.calories, 0)

  const newLoggedToday = {
    ...loggedToday,
    logs: newLogs,
    calories: newCalories,
  }

  return newLoggedToday
}

export function setSelectedDiaryDay(selectedDay: LoggedToday | null) {
  store.dispatch({
    type: SET_SELECTED_DAY,
    selectedDay,
  })
}

export async function handleDiaryDayChange(dateToCheck: string, user: User) {
  try {
    const filter = {
      date: dateToCheck,
      userId: user._id,
    }

    if (!user) return

    const diaryDay = user?.loggedToday?.date

    if (diaryDay === dateToCheck) return

    const diaryDayChange = await dayService.query(filter)

    const newUser = {
      ...user,
      loggedToday: diaryDayChange,
    }

    setSelectedDiaryDay(diaryDayChange)
    optimisticUpdateUser(newUser)
  } catch (err) {
    throw err
  }
}
