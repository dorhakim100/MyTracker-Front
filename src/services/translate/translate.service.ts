import { httpService } from '../http.service'

const KEY = 'translate'
const LATIN_WORDS =
  // eslint-disable-next-line no-useless-escape
  /^\p{Script=Latin}+(?:[’'\-]\p{Script=Latin}+)*(?:\s+\p{Script=Latin}+(?:[’'\-]\p{Script=Latin}+)*)*$/u

export const translateService = {
  translate,
  isEnglishWord,
}

async function translate(q: string, target: string = 'en') {
  try {
    const translated = await httpService.get(KEY, { q, target })

    return translated
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function isEnglishWord(input: string): boolean {
  const s = input.trim()
  if (!s) return false

  // quick reject: any Hebrew/Cyrillic/etc.
  if (/[\u0590-\u05FF\u0400-\u04FF]/.test(s)) return false

  // disallow digits/symbol-heavy tokens
  if (/[0-9_@#]/.test(s)) return false

  return LATIN_WORDS.test(s)
}
