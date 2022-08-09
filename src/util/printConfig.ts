import { sep } from 'path'
import { WriteStream } from '.'
import { resolvedConfig } from '../type'

export function printConfig(
    {write}: WriteStream,
    config: resolvedConfig,
): void {
    write(`config: ${resolveToRel(config.configPath)}\n`)

    write(`\nextends:\n`)
    function printExtended(extended: resolvedConfig['extends'], indent = 2) {
        Object.entries(extended).forEach(([key, ext]) => {
            write(`${''.padEnd(indent)}${resolveToRel(key)}\n`)
            printExtended(ext, indent + 2)
        })
    }
    printExtended(config.extends)

    write(`\nscripts:\n`)
    Object.entries(config.scripts).forEach(([id, conf]) => {
        const confBy = [id, ...conf.configuredBy]
        if (typeof conf.script === 'string') {
            confBy.push(conf.script)
        }
        write(`  ${confBy.map(s => resolveToRel(s)).join(' -> ')}\n`)
    })
}

function relIfPath(module: string) {
    const dir = process.cwd() + sep

    return (module.startsWith(dir) ? module.substr(dir.length) : module).replace(/\\/g, '/')
}
function resolveToRel(module: string) {
    try {
        return relIfPath(require.resolve(module))
    } catch {
        return relIfPath(module)
    }
}
