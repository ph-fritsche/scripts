import fs from 'fs'
import type { config, params, script, argumentDef } from './type'

const configBasename = 'phfscripts.js'

type command = {
    bin: string,
    self: string,
    scriptId: string,
}

export async function run(defaultConfig: config) {
    const configFilename = process.cwd() + '/' + configBasename
    const config = fs.existsSync(configFilename) && fs.lstatSync(configFilename).isFile()
        ? await import(configFilename)
        : defaultConfig
    const resolvedConfig = await resolveConfig(config)

    const [bin, self, scriptId, ...argv] = process.argv

    const script = await resolveScript(resolvedConfig, scriptId)

    const params = getParamsFromArgs({bin, self, scriptId}, script, argv)

    script.run(params)
}

async function resolveConfig(config: config): Promise<config> {
    return config
}

async function resolveScript(config: config, scriptId: string): Promise<script> {
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
    } catch(e) {
        process.stderr.write(`Script ${scriptId} : ${config.scripts[scriptId]} could not be found.\n`)
        process.exit(1)
    }
}

function getParamsFromArgs(command: command, script: script, argv: string[]) {
    const params: params = {options: {}, args: {}, rest: [] }

    let isOption = true
    for (let i = 0; i < argv.length; i++) {
        if (isOption && argv[i] === '--') {
            isOption = false
        } else if (isOption && argv[i] === '--help') {
            printUsage(command, script, process.stdout)
            process.exit(0)
        } else if (isOption && argv[i][0] === '-') {
            const o = script.options?.find(a => a.id === argv[i])
            if (!o) {
                process.stderr.write(`${command.scriptId}: Unknown option "${argv[i]}\n\n`)
                printUsage(command, script, process.stderr)
                process.exit(1)
            }
            const l = o.values?.length ?? 0
            params.options[o.id] = l > 1 ? argv.slice(i + 1, l) : l === 1 ? argv[i + 1] : true
            i += l
        } else {
            const a = script.args ?? []
            argv.slice(i, i + a.length).forEach((v, j) => {
                params.args[a[j].id] = v
            })
            if (argv.length > i + a.length) {
                params.rest = argv.slice(i + a.length)
                if (!script.rest) {
                    process.stderr.write(`Extraneous arguments: ${params.rest.join(' ')}\n`)
                    printUsage(command, script, process.stderr)
                    process.exit(1)
                }
            }
            break
        }
    }

    let optional = false
    const args = script.args ?? []
    args.forEach(a => {
        if (!a.required) {
            optional = true
        } else if (optional) {
            process.stderr.write(`Script definition is flawed. Required arguments must precede optional arguments.\n`)
            printUsage(command, script, process.stderr)
            process.exit(1)
        }
        if (a.required && params.args[a.id] === undefined) {
            process.stderr.write(`Required argument "${a.id}" is missing\n`)
            printUsage(command, script, process.stderr)
            process.exit(1)
        }
    })

    return params
}

function printUsage(command: command, script: script, stream: NodeJS.WriteStream) {
    let cmd = [
        // command.bin,
        // command.self,
        command.scriptId,
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

function printTable(stream: NodeJS.WriteStream, table: (string | undefined)[][]) {
    const width: number[] = []
    const print: string[][] = []
    table.forEach(row => {
        const rowIndex = print.length
        row.forEach((col = '', i) => {
            col.split('\n').forEach((line, j) => {
                width[i] = Math.max(width[i] ?? 0, line.length)
                print[rowIndex + j] = print[rowIndex + j] ?? []
                print[rowIndex + j][i] = line
            })
        })
    })

    print.forEach(row => {
        row.forEach((col = '', i) => {
            if (i > 0) {
                stream.write('  ')
            }
            stream.write(col.padEnd(width[i]))
        })
        stream.write('\n')
    })
}
