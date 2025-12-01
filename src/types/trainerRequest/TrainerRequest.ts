import { User } from '../user/User'

export interface TrainerRequest {
  _id: string
  trainerId: string
  traineeId: string
  trainee?: User
  status: 'pending' | 'accepted' | 'rejected'
}
