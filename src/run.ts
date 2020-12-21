import type { config } from './type'
import { getParamsFromArgs } from './util/getParamsFromArgv'
import { resolveConfig } from './util/resolveConfig'
import { resolveScript } from './util/resolveScript'

const configBasename = 'scripts.config.js'

export async function run(defaultConfig: config) {
    const resolvedConfig = await resolveConfig(defaultConfig, configBasename)

    const [bin, self, scriptId, ...argv] = process.argv

    const script = await resolveScript(resolvedConfig, scriptId)

    const params = getParamsFromArgs(scriptId, script, argv)

    script.run(params)
}
