import fs from 'fs'
import type { config } from "../type"

export async function resolveConfig(defaultConfig: config, configBasename: string): Promise<config> {
    const configFilename = process.cwd() + '/' + configBasename

    const config = fs.existsSync(configFilename) && fs.lstatSync(configFilename).isFile()
        ? await import(configFilename).then(m => m.default ?? m)
        : defaultConfig

    return config
}
