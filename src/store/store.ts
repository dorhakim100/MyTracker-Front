import { legacy_createStore as createStore, combineReducers } from 'redux'

import { itemReducer } from './reducers/item.reducer'
import { systemReducer } from './reducers/system.reducer.ts'
import { userReducer } from './reducers/user.reducer.ts'
import { workoutReducer } from './reducers/workout.reducer.ts'
import { healthReducer } from './reducers/health.reducer.ts'

const rootReducer = combineReducers({
  itemModule: itemReducer,
  systemModule: systemReducer,
  userModule: userReducer,
  workoutModule: workoutReducer,
  healthModule: healthReducer,
})

export const store = createStore(rootReducer, undefined)

export type RootState = ReturnType<typeof rootReducer>
