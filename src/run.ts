import { getParamsFromArgv } from './util/getParamsFromArgv'
import { printMainUsage } from './util/printUsage'
import { resolveConfig } from './util/resolveConfig'
import { resolveScript } from './util/resolveScript'

const configBasename = 'scripts.config.js'

export async function run(): Promise<void> {
    const resolvedConfig = await resolveConfig(configBasename)

    const [, , scriptId, ...argv] = process.argv

    if (scriptId === '--help' || scriptId === '') {
        printMainUsage(resolvedConfig, process.stdout)
        process.exit(0)
    }

    const script = await resolveScript(resolvedConfig, scriptId)

    const params = getParamsFromArgv(scriptId, script, argv)

    script.run(params)
}
