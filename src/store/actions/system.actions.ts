import { store } from '../store'
import { Prefs } from '../../types/system/Prefs'
import { systemService } from '../../services/system/system.service'

import {
  LOADING_START,
  LOADING_DONE,
  SET_PREFS,
  SET_IS_ADD_MODAL,
  SET_IS_ACCESSIBILITY,
  SET_IS_PREFS,
  SET_IS_MODAL,
  SET_MODAL_MESSAGE,
  SET_SLIDE_DIRECTION,
  // SET_SHOWED_UPDATE_MESSAGE,
  SET_NAVIGATE_TO,
  SET_IS_FIRST_LOADING,
  SET_IS_NATIVE,
  SET_IS_DASHBOARD,
} from '../reducers/system.reducer'

export function setIsLoading(stateToSet: boolean) {
  store.dispatch({ type: stateToSet ? LOADING_START : LOADING_DONE })
}

export function setPrefs(prefsToSet: Prefs) {
  const prefs = { ...prefsToSet }

  systemService.setPrefs(prefs)
  store.dispatch({ type: SET_PREFS, prefs })
}

export async function loadPrefs() {
  try {
    const prefs = await systemService.getPrefs()
    store.dispatch({ type: SET_PREFS, prefs })
  } catch {
    // ignore
  }
}
export function setIsPrefs(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_PREFS, isPrefs: stateToSet })
}

export function setIsAddModal(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_ADD_MODAL, isAddModal: stateToSet })
}
export function setIsAccessibility(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_ACCESSIBILITY, isAccessibility: stateToSet })
}

export function setIsModal(stateToSet: boolean) {
  store.dispatch({ type: SET_IS_MODAL, isModal: stateToSet })
}
export function setModalMessage(messageToSet: string) {
  store.dispatch({ type: SET_MODAL_MESSAGE, modalMessage: messageToSet })
}

export function setSlideDirection(directionToSet: number) {
  store.dispatch({ type: SET_SLIDE_DIRECTION, slideDirection: directionToSet })
}
export function setNavigateTo(navigateToToSet: string) {
  store.dispatch({ type: SET_NAVIGATE_TO, navigateTo: navigateToToSet })
}
export function setIsFirstLoading(isFirstLoadingToSet: boolean) {
  store.dispatch({
    type: SET_IS_FIRST_LOADING,
    isFirstLoading: isFirstLoadingToSet,
  })
}
export function onClosePrefsHeader() {
  setIsPrefs(false)
}
export function setIsNative(isNativeToSet: boolean) {
  store.dispatch({ type: SET_IS_NATIVE, isNative: isNativeToSet })
}
export function setIsDashboard(isDashboardToSet: boolean) {
  store.dispatch({ type: SET_IS_DASHBOARD, isDashboard: isDashboardToSet })
}