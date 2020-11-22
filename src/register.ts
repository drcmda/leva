import { warn, TwixErrors } from './utils/log'
import { Plugin, ValueInputWithSettings } from './types'

const schemas: ((v: any) => false | string)[] = []

export const Plugins: Record<string, Omit<Plugin<any, any>, 'schema'>> = {}

export function getValueType(value: any, path: string) {
  for (let checker of schemas) {
    const type = checker(value)
    if (type) return type
  }
  warn(TwixErrors.UNKNOWN_INPUT, path, value)
  return undefined
}

export function register<V, Settings extends object>({ schema, ...plugin }: Plugin<V, Settings>, type: string) {
  if (type in Plugins) {
    warn(TwixErrors.ALREADY_REGISTERED_TYPE, type)
    return
  }
  schemas.push((value: any) => schema(value) && type)
  Plugins[type] = plugin
}

export function normalizeSettings<V, Settings extends object>(
  type: string,
  input: ValueInputWithSettings<V, Settings>
) {
  const { settings } = Plugins[type]
  if (settings) return settings(input)
  const { value, ...s } = input
  return s
}
