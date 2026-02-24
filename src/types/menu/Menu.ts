import { Log } from '../log/Log'

export interface Menu {
  _id: string
  userId: string
  menuLogs: Log[]
  name?: string
  isSelected?: boolean
}

export interface MenuFilter {
  userId: string
}
