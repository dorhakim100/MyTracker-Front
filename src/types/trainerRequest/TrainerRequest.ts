import { User } from '../user/User'

import {
  PENDING_STATUS,
  APPROVED_STATUS,
  REJECTED_STATUS,
} from '../../assets/config/request-statuses'
export interface TrainerRequest {
  _id: string
  trainerId: string
  traineeId: string
  trainee?: User
  trainer?: User
  status:
    | typeof PENDING_STATUS
    | typeof APPROVED_STATUS
    | typeof REJECTED_STATUS
}
