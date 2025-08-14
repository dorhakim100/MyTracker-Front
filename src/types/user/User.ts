export interface User {
  _id: string

  fullname: string

  email: string

  password?: string
  imgUrl?: string
  isGuest?: boolean
}
