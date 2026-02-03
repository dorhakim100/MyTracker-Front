import { store } from '../store'
import { userService } from '../../services/user/user.service'

import {
  SET_USER,
  SET_USERS,
  REMOVE_USER,
  SET_WATCHED_USER,
  SET_USER_TO_EDIT,
  SET_SELECTED_DAY,
  SET_TRAINEE_USER,
  REMOVE_TRAINEE_USER,
  SET_TRAINEE_USERS,
  ADD_TRAINEE,
  // SET_USER_FILTER,
} from '../reducers/user.reducer'

import { UserFilter } from '../../types/userFilter/UserFilter'
import { UserCred } from '../../types/userCred/UserCred'
import { User } from '../../types/user/User'
import { Item } from '../../types/item/Item'
import { Log } from '../../types/log/Log'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { dayService } from '../../services/day/day.service'
import { addFavoriteItem, removeFavoriteItem } from './item.actions'
import { mealService } from '../../services/meal/meal.service'
import { Meal } from '../../types/meal/Meal'
import { ActivityLevel, Gender } from '../../services/bmr/bmr.service'
import { Goal } from '../../types/goal/Goal'
import { goalService } from '../../services/goal/goal.service'
import { setIsFirstLoading } from './system.actions'
import { AddTraineeForm } from '../../pages/TrainerDashboard/pages/Trainees/Trainees'

export async function loadUsers(filter: UserFilter) {
  try {
    // store.dispatch({ type: SET_USER_FILTER, filter })
    const users = await userService.getUsers(filter)
    store.dispatch({ type: SET_USERS, users })
    return users
  } catch (err) {
    throw err
  }
}

export async function removeUser(userId: string) {
  try {
    await userService.remove(userId)
    store.dispatch({ type: REMOVE_USER, userId })
    setUserToEdit(null)
    setSelectedDiaryDay(null)
  } catch (err) {
    throw err
  }
}

export async function login(credentials: UserCred) {
  try {
    await logout()

    const retrived = await userService.login(credentials)

    if (!retrived) {
      return null
    }

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
    return user
  } catch (err) {
    throw err
  }
}

export async function deleteAccount(user: User) {
  try {
    await userService.remove(user._id)
  } catch (err) {
    throw err
  }
}

export async function handleGuestMode() {
  try {
    await _loginWithGuest()
  } catch (err) {
    throw err
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
        activity: 'sedentary' as ActivityLevel,
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
    throw err
  }
}

export async function updateUser(userToUpdate: User) {
  try {
    const saved = await userService.update(userToUpdate)

    const user = store.getState().userModule.user
    if (user?._id === userToUpdate._id) {
      store.dispatch({
        type: SET_USER,
        user: saved,
      })
    }

    return saved
  } catch (err) {
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
    throw err
  }
}

export async function loadUser(userId: string) {
  try {
    const user = await userService.getById(userId)

    store.dispatch({ type: SET_WATCHED_USER, user })
    return user
  } catch (err) {
    throw err
  }
}

export async function handleFavorite(item: Item, user: User) {
  try {
    let favoriteArray = user.favoriteItems || []

    if (item.items && item.items.length > 0) {
      const hasMeal = user.meals.some((meal: Meal) => meal._id === item._id)

      const newMeals = hasMeal
        ? user.meals.filter((meal: Meal) => meal._id !== item._id)
        : [...user.meals, item]
      const userToSave = {
        ...user,
        meals: newMeals,
      }

      await updateUser(userToSave as User)
      return
    }

    if (!item.searchId) return

    if (favoriteArray.includes(item.searchId)) {
      favoriteArray = favoriteArray.filter((id: string) => id !== item.searchId)
      // await searchService.removeFromCache(item, FAVORITE_CACHE)
      removeFavoriteItem(item)
    } else {
      // await searchService.addToCache(item, FAVORITE_CACHE)
      favoriteArray.push(item.searchId)
      addFavoriteItem(item)
    }

    const userToSave = {
      ...user,
      favoriteItems: [...favoriteArray],
    }

    await updateUser(userToSave)
  } catch (err) {
    console.log('err', err)
    throw err
  }
}

export async function setRemembered() {
  try {
    setIsFirstLoading(true)
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
  } finally {
    setIsFirstLoading(false)
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

export async function handleDiaryDayChange(
  dateToCheck: string,
  user: User
  // traineeUser: User | null
) {
  try {
    // const userToCheck = traineeUser ? traineeUser : user
    const userToCheck = user
    const filter = {
      date: dateToCheck,
      userId: userToCheck._id,
    }

    if (!user) return

    // const diaryDay = traineeUser
    //   ? traineeUser?.loggedToday?.date
    //   : user?.loggedToday?.date

    const diaryDay = user?.loggedToday?.date

    if (diaryDay === dateToCheck) return

    const diaryDayChange = await dayService.query(filter)

    setSelectedDiaryDay(diaryDayChange)
    const newUser = {
      ...userToCheck,
      loggedToday: diaryDayChange,
    }
    const traineeUser = store.getState().userModule.traineeUser

    if (!traineeUser) {
      optimisticUpdateUser(newUser)
    } else {
      setTraineeUser(newUser)
      const trainees = store.getState().userModule.trainees
      const traineeIdx = trainees.findIndex(
        (trainee) => trainee._id === newUser._id
      )
      if (traineeIdx !== -1) {
        trainees[traineeIdx] = newUser
        setTrainees(trainees)
      }
    }
    return newUser.loggedToday
  } catch (err) {
    throw err
  }
}

export async function handleFirstGoal(goal: Goal, user: User) {
  try {
    goal.userId = user._id
    if (!goal.title) goal.title = 'My Goal'

    const savedGoal = await goalService.save(goal)

    const newUser = {
      ...user,
      goals: [savedGoal],
    }
    optimisticUpdateUser(newUser)

    await updateUser(newUser)
  } catch (err) {
    throw err
  }
}

export function setTraineeUser(traineeUser: User) {
  store.dispatch({
    type: SET_TRAINEE_USER,
    traineeUser,
  })
}

export function removeTraineeUser() {
  store.dispatch({ type: REMOVE_TRAINEE_USER })
}

export function setTrainees(trainees: User[]) {
  store.dispatch({ type: SET_TRAINEE_USERS, trainees })
}

export async function addTrainee(traineeForm: AddTraineeForm) {
  try {
    const trainee = await userService.addTrainee(traineeForm)
    store.dispatch({ type: ADD_TRAINEE, trainee })
    return trainee
  } catch (error) {
    throw error
  }
}
