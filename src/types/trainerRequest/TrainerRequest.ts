import { User } from '../user/User'

export interface TrainerRequest {
  _id: string
  trainerId: string
  traineeId: string
  trainee?: User
  trainer?: User
  status: 'pending' | 'accepted' | 'rejected'
}
