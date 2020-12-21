import type { config, script } from "../type"

export async function resolveScript(config: config, scriptId: string): Promise<script> {
    if (!config.scripts || !config.scripts[scriptId]) {
        process.stderr.write(`Script ${scriptId} is not defined.\n`)
        process.exit(1)
    }

    try {
        let script = await import(config.scripts[scriptId])
        if (script.default) {
            script = script.default
        }
        if (typeof script?.run !== 'function') {
            process.stderr.write(`Script ${config.scripts[scriptId]} is invalid.\n`)
            process.exit(1)
        }
        return script
    } catch (e) {
        process.stderr.write(`Script ${scriptId} : ${config.scripts[scriptId]} could not be found.\n`)
        process.exit(1)
    }
}
