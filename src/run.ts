import { stderr, stdin, stdout } from 'process'
import type { config } from './type'
import { getParamsFromArgv, printConfig, printMainUsage, resolveConfig, resolveScript } from './util'

export async function run(
    scriptId = '',
    scriptArgs: string[] = [],
    config?: config,
): Promise<void> {
    const streams = { in: stdin, out: stdout, err: stderr }

    const resolvedConfig = await resolveConfig(config)

    if (scriptId === '' || scriptId.startsWith('-')) {
        if (scriptId === '--debug-config') {
            printConfig(resolvedConfig, streams.out)
        } else if (scriptId === '--help' || scriptId === '') {
            printMainUsage(resolvedConfig, streams.out)
        }
        throw 0
    }

    const script = await resolveScript(streams, resolvedConfig.scripts, scriptId)

    const params = getParamsFromArgv(streams, scriptId, script, scriptArgs)

    await script.run(params)
}

export type streams = {
    in: NodeJS.ReadStream,
    out: NodeJS.WriteStream,
    err: NodeJS.WriteStream,
}
