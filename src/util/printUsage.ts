import type { config, script } from '../type'
import { getOptionIdent } from './getOptionIdent'
import { printTable } from './printTable'

const main = {
    description: 'Run scripts',
    usage: '<scriptId> [options] [...args]',
}

export function printMainUsage(config: config, stream: NodeJS.WriteStream): void {
    stream.write(`\n${main.description}\n`)

    stream.write(`\nUsage:${main.usage}\n`)

    stream.write(`\nAvailable scripts:\n`)
    const scriptsTable: (string | undefined)[][] = []
    for(const id in config.scripts) {
        scriptsTable.push(['', id, '-->', config.scripts[id]])
    }
    printTable(stream, scriptsTable)

    stream.write('\n')
}

export function printUsage(scriptId: string, script: script, stream: NodeJS.WriteStream): void {
    const cmd = [
        scriptId,
        Object.keys(script.options ?? {}).length && '[options]',
        ...(script.requiredArgs ?? []).map(a => `<${a.id}>`),
        ...(script.optionalArgs ?? []).map(a => `[${a.id}]`),
        script.variadicArgs && `[...${script.variadicArgs.id}]`,
    ].filter(Boolean).join(' ')

    if (script.description) {
        stream.write(`\n${script.description}\n`)
    }

    stream.write(`\nUsage:\n  ${cmd}\n`)

    const options = script.options
    if (options) {
        stream.write(`\nOptions:\n`)
        printTable(stream, Object.keys(options).map(k => {
            const o = options[k]
            return [
                undefined,
                [getOptionIdent('short', k, o), getOptionIdent('long', k, o)].filter(Boolean).join(', '),
                (o.value ?? []).map(i => `<${i}>`).join(' '),
                o.description,
            ]
        }))
    }

    const argTable: (string | undefined)[][] = []
    script.requiredArgs?.forEach(a => {
        argTable.push(['', `<${a.id}>`, a.description])
    })
    script.optionalArgs?.forEach(a => {
        argTable.push(['', `[${a.id}]`, a.description])
    })
    if (script.variadicArgs) {
        const a = script.variadicArgs
        argTable.push(['', `[...${a.id}]`, a.description])
    }
    if (argTable.length) {
        stream.write(`\nArguments:\n`)
        printTable(stream, argTable)
    }

    stream.write('\n')
}
