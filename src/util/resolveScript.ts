import type { resolvedConfig, script } from '../type'
import type { WriteStream } from '.'
import { importDefault } from './importDefaultInterOp'

export async function resolveScript(errStream: WriteStream, scripts: resolvedConfig['scripts'], scriptId: string): Promise<script> {
    if (!scripts || !scripts[scriptId]) {
        errStream.write(`Script "${scriptId}" is not defined.\n`)
        throw 1
    }

    try {
        const scriptDef = scripts[scriptId].script
        const script = typeof scriptDef === 'string'
            ? await importDefault<script>(scriptDef)
            : scriptDef

        if (typeof script.run !== 'function') {
            errStream.write(`Script ${scriptId} is invalid.\n`)
            throw 1
        }

        return script

    } catch (e) {
        errStream.write(`Script ${scriptId} could not be found.\n`)
        throw 1
    }
}
