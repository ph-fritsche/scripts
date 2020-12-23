import type { streams } from '../run'
import type { config, script } from '../type'
import dynamicImport from './import'

export async function resolveScript(streams: streams, config: config, scriptId: string): Promise<script> {
    if (!config.scripts || !config.scripts[scriptId]) {
        streams.err.write(`Script "${scriptId}" is not defined.\n`)
        throw 1
    }

    try {
        let script = await dynamicImport(config.scripts[scriptId])
        if (script.default) {
            script = script.default
        }
        if (typeof script?.run !== 'function') {
            streams.err.write(`Script ${config.scripts[scriptId]} is invalid.\n`)
            throw 1
        }
        return script
    } catch (e) {
        streams.err.write(`Script ${scriptId} : ${config.scripts[scriptId]} could not be found.\n`)
        throw 1
    }
}
