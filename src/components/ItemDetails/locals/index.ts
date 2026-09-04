import { registerLocals } from '../../../services/i18n/register-locals'
import eng from './eng.json'
import heb from './heb.json'

export const itemDetailsNs = 'ItemDetails'

registerLocals(itemDetailsNs, { eng, heb })
