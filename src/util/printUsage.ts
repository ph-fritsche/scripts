import type { script } from '../type'
import { getOptionIdent } from './getOptionIdent'
import { printTable } from './printTable'

export function printUsage(scriptId: string, script: script, stream: NodeJS.WriteStream) {
    let cmd = [
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
                ,
                [getOptionIdent('short', k, o), getOptionIdent('long', k, o)].filter(Boolean).join(', '),
                (o.value ?? []).map(i => `<${i}>`).join(' '),
                o.description
            ]
        }))
    }

    const argTable: (string | undefined)[][] = []
    script.requiredArgs?.forEach(a => {
        argTable.push([, `<${a.id}>`, a.description])
    })
    script.optionalArgs?.forEach(a => {
        argTable.push([, `[${a.id}]`, a.description])
    })
    if (script.variadicArgs) {
        const a = script.variadicArgs
        argTable.push([, `[...${a.id}]`, a.description])
    }
    if (argTable.length) {
        stream.write(`\nArguments:\n`)
        printTable(stream, argTable)
    }
}
