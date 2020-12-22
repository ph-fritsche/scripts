import { getParamsFromArgs } from './util/getParamsFromArgv'
import { printMainUsage, printUsage } from './util/printUsage'
import { resolveConfig } from './util/resolveConfig'
import { resolveScript } from './util/resolveScript'

const configBasename = 'scripts.config.js'

export async function run() {
    const resolvedConfig = await resolveConfig(configBasename)

    const [bin, self, scriptId, ...argv] = process.argv

    if (scriptId === '--help' || scriptId === '') {
        printMainUsage(resolvedConfig, process.stdout)
        process.exit(0)
    }

    const script = await resolveScript(resolvedConfig, scriptId)

    const params = getParamsFromArgs(scriptId, script, argv)

    script.run(params)
}
