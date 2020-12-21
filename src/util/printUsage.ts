import type { argumentDef, script } from '../type'
import { printTable } from './printTable'

export function printUsage(scriptId: string, script: script, stream: NodeJS.WriteStream) {
    let cmd = [
        scriptId,
        script.options?.length && '[options]',
        ...(script.args ?? []).map(a => a.required ? `<${a.id}>` : `[${a.id}]`),
        script.rest && `[...${script.rest.id}]`,
    ].filter(Boolean).join(' ')

    stream.write(`Usage: ${cmd}\n`)

    if (script.options?.length) {
        stream.write(`\nOptions:\n`)
        printTable(stream, script.options.map(o => [
            ,
            o.id + (o.values ?? []).map(i => ` <${i}>`),
            o.description
        ]))
    }

    const argTable: argumentDef[] = script.args ?? []
    if (script.rest) {
        argTable.push(script.rest)
    }

    if (argTable.length) {
        stream.write(`\nArguments:\n`)
        printTable(stream, argTable.map((a, i) => {
            const id = (i === argTable.length - 1 && script.rest)
                ? `...${a.id}`
                : `${a.id}` + (a.required ? '' : '?')

            return [, id, a.description]
        }))
    }
}

