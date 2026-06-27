import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const LOCAL_IOS_PLUGINS = ['StepsWidgetPlugin']
const configPath = join(process.cwd(), 'ios/App/App/capacitor.config.json')

const config = JSON.parse(readFileSync(configPath, 'utf8'))
config.packageClassList = [
  ...new Set([...(config.packageClassList ?? []), ...LOCAL_IOS_PLUGINS]),
]
writeFileSync(configPath, `${JSON.stringify(config, null, '\t')}\n`)
