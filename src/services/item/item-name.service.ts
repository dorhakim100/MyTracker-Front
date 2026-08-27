import { ItemName, LocalizedName } from '../../types/item/LocalizedName'

function hasHebrew(value: string) {
  return /[\u0590-\u05FF]/.test(value)
}

function hasLatin(value: string) {
  return /[a-zA-Z]/.test(value)
}

function isLocalizedName(name: ItemName | undefined): name is LocalizedName {
  return typeof name === 'object' && name !== null && !Array.isArray(name)
}

function getItemDisplayName(
  name: ItemName | undefined,
  lang: string = 'en'
): string {
  if (!name) return ''
  if (typeof name === 'string') return name
  if (isLocalizedName(name)) {
    if (lang === 'he' || lang === 'heb') {
      return name.he || name.default || name.eng || ''
    }
    return name.eng || name.default || name.he || ''
  }
  return String(name)
}

function getItemSearchText(name: ItemName | undefined): string {
  if (!name) return ''
  if (typeof name === 'string') return name
  return [name.eng, name.he, name.default].filter(Boolean).join(' ')
}

function toLocalizedName(name: ItemName | undefined): LocalizedName {
  if (isLocalizedName(name)) {
    return {
      eng: name.eng || '',
      he: name.he || '',
      default: name.default || name.eng || name.he || '',
    }
  }

  const raw = (name || '').trim()
  if (!raw) return { eng: '', he: '', default: '' }
  if (hasHebrew(raw) && !hasLatin(raw)) {
    return { eng: '', he: raw, default: raw }
  }
  if (hasLatin(raw) && !hasHebrew(raw)) {
    return { eng: raw, he: '', default: raw }
  }
  return { eng: raw, he: raw, default: raw }
}

function fromExternalName(raw: string | undefined): LocalizedName {
  return toLocalizedName(raw || '')
}

export const itemNameService = {
  isLocalizedName,
  getItemDisplayName,
  getItemSearchText,
  toLocalizedName,
  fromExternalName,
}
