import { stderr, stdin, stdout } from 'process'
import type { config } from './type'
import { getParamsFromArgv, printConfig, printMainUsage, resolveConfig, resolveScript, WriteStream } from './util'

export async function run(
    scriptId = '',
    scriptArgs: string[] = [],
    config?: config,
    {
        in: input = stdin,
        out: output = stdout,
        err: errput = stderr,
    }: {
        in?: NodeJS.ReadStream
        out?: NodeJS.WriteStream
        err?: NodeJS.WriteStream
    } = {},
) {
    const resolvedConfig = await resolveConfig(config)

    if (scriptId === '' || scriptId.startsWith('-')) {
        if (scriptId === '--debug-config') {
            printConfig(output, resolvedConfig)
        } else if (scriptId === '--help' || scriptId === '') {
            printMainUsage(output, resolvedConfig)
        }
        throw 0
    }

    const script = await resolveScript(errput, resolvedConfig.scripts, scriptId)

    const params = getParamsFromArgv(errput, scriptId, script, scriptArgs)

    await script.run(params, {in: input, out: output, err: errput})
}
