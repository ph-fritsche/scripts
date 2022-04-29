import type { streams } from '../run'
import type { resolvedConfig, script } from '../type'
import { importDefault } from './importDefaultInterOp'

export async function resolveScript(streams: streams, scripts: resolvedConfig['scripts'], scriptId: string): Promise<script> {
    if (!scripts || !scripts[scriptId]) {
        streams.err.write(`Script "${scriptId}" is not defined.\n`)
        throw 1
    }

    try {
        const scriptDef = scripts[scriptId].script
        const script = typeof scriptDef === 'string'
            ? await importDefault<script>(scriptDef)
            : scriptDef

        if (typeof script?.run !== 'function') {
            streams.err.write(`Script ${scriptId} is invalid.\n`)
            throw 1
        }

        return script

    } catch (e) {
        streams.err.write(`Script ${scriptId} could not be found.\n`)
        throw 1
    }
}
