import type { streams } from '../run'
import type { resolvedConfig, script } from '../type'
import dynamicImport from './import'

export async function resolveScript(streams: streams, scripts: resolvedConfig['scripts'], scriptId: string): Promise<script> {
    if (!scripts || !scripts[scriptId]) {
        streams.err.write(`Script "${scriptId}" is not defined.\n`)
        throw 1
    }

    try {
        const scriptDef = scripts[scriptId].script
        const script = typeof scriptDef === 'string'
            ? await dynamicImport(scriptDef).then(m => m.default ?? m)
            : scriptDef

        if (typeof script?.run !== 'function') {
            streams.err.write(`Script ${scripts[scriptId]} is invalid.\n`)
            throw 1
        }

        return script

    } catch (e) {
        streams.err.write(`Script ${scriptId} : ${scripts[scriptId]} could not be found.\n`)
        throw 1
    }
}
