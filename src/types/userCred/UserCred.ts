import { UserDetails } from '../user/User'

export interface UserCred {
  email: string

  password: string
  validatePassword?: string
  fullname?: string
  imgUrl?: string
  isRemember?: boolean
  isGuest?: boolean

  details: UserDetails
}
