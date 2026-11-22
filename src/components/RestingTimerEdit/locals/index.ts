import { registerLocals } from '../../../services/i18n/register-locals'
import eng from './eng.json'
import heb from './heb.json'

export const restingTimerEditNs = 'RestingTimerEdit'

registerLocals(restingTimerEditNs, { eng, heb })
