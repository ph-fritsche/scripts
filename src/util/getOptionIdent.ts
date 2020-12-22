import { optionDef } from '../type'

const prefixes = {
    short: '-',
    long: '--',
}

export function getOptionIdent(
    type: 'short' | 'long',
    id: string,
    option: optionDef,
    prefix = true,
): string | undefined {
    if (option[type] === false) {
        return undefined
    } else if (option[type]) {
        return (prefix ? prefixes[type] : '') + option[type]
    }

    if (type === 'short' && id.length === 1 || type === 'long' && id.length > 1) {
        return (prefix ? prefixes[type] : '') + id
    }
}
