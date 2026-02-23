import { Log } from '../log/Log'

export interface Menu {
  _id: string
  userId: string
  menuLogs: Log[]
}

export interface MenuFilter {
  userId: string
}
