import type { script } from '../type'
import { printUsage } from './printUsage'

export function printError(
    scriptId: string,
    script: script,
    msg: string,
    usage = false,
    exit = true,
): void {
    process.stderr.write(`error: ${msg}\n`)
    if (usage) {
        printUsage(scriptId, script, process.stderr)
    }
    if (exit) {
        process.exit(1)
    }
}
