import fs from 'fs'
import type { config } from '../type'
import dynamicImport from './import'

export async function resolveConfig(configBasename: string): Promise<config> {
    const configFilename = findConfigFile(configBasename)

    const primaryConfig = configFilename
        ? await dynamicImport(configFilename).then(m => m.default ?? m)
        : {}

    return resolveConfigExtensions(primaryConfig)
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

async function resolveConfigExtensions(config: config, resolved: string[] = []): Promise<config> {
    let scripts = {}

    return Promise.all((config.extends ?? []).map(async c => {
        if (resolved.includes(c)) {
            throw `Circular reference for "${c}"\n${resolved.join(' -> ')}`
        }

        return dynamicImport(c).then(m => m.default ?? m).then(m => resolveConfigExtensions(m, resolved.concat(c)))
    })).then(extendedConfigs => {
        extendedConfigs.forEach(c => {
            scripts = {...scripts, ...c.scripts}
        })

        return {
            scripts: {...scripts, ...config.scripts},
        }
    })
}
