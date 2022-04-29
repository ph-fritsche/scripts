import fs from 'fs'
import type { config, resolvedConfig } from '../type'
import { importDefault } from './importDefaultInterOp'

const configBasename = 'scripts.config.js'

export async function resolveConfig(config?: config | string): Promise<resolvedConfig> {
    if (config && typeof config !== 'string') {
        return resolveConfigExtensions('[inline]', config)
    }

    const configFilename = findConfigFile(config || configBasename)

    const primaryConfig = configFilename
        ? await importDefault<config>(configFilename)
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

type scriptsEntry = [string, resolvedConfig['scripts'][string]]
async function resolveConfigExtensions(configPath: string, config: config, resolved: string[] = []): Promise<resolvedConfig> {
    const extendedNames = config.extends ?? []

    const imports = Promise.all(extendedNames.map(async c => {
        if (resolved.includes(c)) {
            throw `Circular reference for "${c}"\n${resolved.join(' -> ')}`
        }

        return importDefault<config>(c).then(m => resolveConfigExtensions(c, m, resolved.concat(c)))
    }))

    return imports.then(extendedConfigs => {
        const extendedScriptsEntries = extendedConfigs.map(c => Object.entries(c.scripts)
            .map<scriptsEntry>(([id, s]) => [
                id,
                {
                    ...s,
                    configuredBy: [c.configPath].concat(s.configuredBy),
                },
            ]),
        )
        const ownScriptsEntries = Object.entries(config.scripts ?? {})
            .map<scriptsEntry>(([id, script]) => [
                id,
                {
                    configuredBy: [],
                    script,
                },
            ])

        return {
            configPath,
            extends: Object.fromEntries(extendedNames.map((k, i) => [k, extendedConfigs[i].extends])),
            scripts: Object.fromEntries(([] as scriptsEntry[]).concat(...extendedScriptsEntries, ownScriptsEntries)),
        }
    })
}
