import fs from 'fs'
import type { config, resolvedConfig } from '../type'
import dynamicImport from './import'

export async function resolveConfig(configBasename: string): Promise<resolvedConfig> {
    const configFilename = findConfigFile(configBasename)

    const primaryConfig = configFilename
        ? await dynamicImport(configFilename).then(m => m.default ?? m)
        : {}

    return resolveConfigExtensions(configFilename ?? `[not found] ${configBasename}`, primaryConfig)
}

function findConfigFile(configBasename: string, dir: string = process.cwd()): string | undefined {
    const filename = dir + (dir.substr(-1) !== '/' ? '/' : '') + configBasename

    if (fs.existsSync(filename) && fs.lstatSync(filename).isFile()) {
        return filename
    }

    const parent = fs.realpathSync(dir + '/..')

    if (parent !== dir) {
        return findConfigFile(configBasename, parent)
    }
}

async function resolveConfigExtensions(configPath: string, config: config, resolved: string[] = []): Promise<resolvedConfig> {
    const extended = config.extends ?? []
    let scripts = {}

    const imports = Promise.all(extended.map(async c => {
        if (resolved.includes(c)) {
            throw `Circular reference for "${c}"\n${resolved.join(' -> ')}`
        }

        return dynamicImport(c).then(m => m.default ?? m).then(m => resolveConfigExtensions(c, m, resolved.concat(c)))
    }))

    return imports.then(extendedConfigs => {
        extendedConfigs.forEach(c => {
            scripts = {...scripts, ...c.scripts}
        })

        return {
            configPath,
            extends: Object.fromEntries(extended.map((k, i) => [k, extendedConfigs[i].extends])),
            scripts: {
                ...scripts,
                ...Object.fromEntries(Object.entries(config.scripts ?? {}).map(([id, script]) => [id, {
                    configuredBy: configPath,
                    script,
                }])),
            },
        }
    })
}
