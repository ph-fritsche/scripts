import { getParamsFromArgv } from './util/getParamsFromArgv'
import { printMainUsage } from './util/printUsage'
import { resolveConfig } from './util/resolveConfig'
import { resolveScript } from './util/resolveScript'

const configBasename = 'scripts.config.js'

export async function run(): Promise<void> {
    const streams = {
        in: process.stdin,
        out: process.stdout,
        err: process.stderr,
    }
    const exit = process.exit

    try {
        const resolvedConfig = await resolveConfig(configBasename)

        const [, , scriptId, ...argv] = process.argv

        if (scriptId === '--help' || !scriptId) {
            printMainUsage(resolvedConfig, streams.out)
            throw 0
        }

        const script = await resolveScript(streams, resolvedConfig, scriptId)

        const params = getParamsFromArgv(streams, scriptId, script, argv)

        script.run(params)

    } catch(code) {
        exit(typeof(code) === 'number' ? code : 2)
    }
}

export type streams = {
    in: NodeJS.ReadStream,
    out: NodeJS.WriteStream,
    err: NodeJS.WriteStream,
}
