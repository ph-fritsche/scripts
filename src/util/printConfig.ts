import { sep } from 'path'
import { resolvedConfig } from '../type'

export function printConfig(config: resolvedConfig, stream: NodeJS.WriteStream): void {
    stream.write(`config: ${resolveToRel(config.configPath)}\n`)

    stream.write(`\nextends:\n`)
    function printExtended(extended: resolvedConfig['extends'], indent = 2) {
        Object.entries(extended).forEach(([key, ext]) => {
            stream.write(`${''.padEnd(indent)}${resolveToRel(key)}\n`)
            printExtended(ext, indent + 2)
        })
    }
    printExtended(config.extends)

    stream.write(`\nscripts:\n`)
    Object.entries(config.scripts).forEach(([id, conf]) => {
        const confBy = [id, ...conf.configuredBy]
        if (typeof conf.script === 'string') {
            confBy.push(conf.script)
        }
        stream.write(`  ${confBy.map(s => resolveToRel(s)).join(' -> ')}\n`)
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
