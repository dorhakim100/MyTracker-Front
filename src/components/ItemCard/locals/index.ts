import { registerLocals } from '../../../services/i18n/register-locals'
import eng from './eng.json'
import heb from './heb.json'

export const itemCardNs = 'ItemCard'

registerLocals(itemCardNs, { eng, heb })
