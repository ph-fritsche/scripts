import { stderr, stdin, stdout } from 'process'
import { getParamsFromArgv, printMainUsage, resolveConfig, resolveScript } from './util'

const configBasename = 'scripts.config.js'

export async function run(
    scriptId = '',
    scriptArgs: string[] = [],
): Promise<void> {
    const streams = { in: stdin, out: stdout, err: stderr }

    const resolvedConfig = await resolveConfig(configBasename)

    if (scriptId === '--help' || scriptId === '') {
        printMainUsage(resolvedConfig, streams.out)
        throw 0
    }

    const script = await resolveScript(streams, resolvedConfig.scripts, scriptId)

    const params = getParamsFromArgv(streams, scriptId, script, scriptArgs)

    script.run(params)
}

export type streams = {
    in: NodeJS.ReadStream,
    out: NodeJS.WriteStream,
    err: NodeJS.WriteStream,
}
