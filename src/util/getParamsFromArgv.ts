import { params, script } from "../type"
import { printUsage } from "./printUsage"

export function getParamsFromArgs(scriptId: string, script: script, argv: string[]) {
    const params: params = { options: {}, args: {}, rest: [] }

    let parseOptions = true
    for (let i = 0; i < argv.length; i++) {
        if (parseOptions && argv[i] === '--') {
            parseOptions = false
        } else if (parseOptions && argv[i] === '--help') {
            printUsage(scriptId, script, process.stdout)
            process.exit(0)
        } else if (parseOptions && argv[i][0] === '-') {
            const o = script.options?.find(a => a.id === argv[i])
            if (!o) {
                process.stderr.write(`${scriptId}: Unknown option "${argv[i]}\n\n`)
                printUsage(scriptId, script, process.stderr)
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
                    printUsage(scriptId, script, process.stderr)
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
            printUsage(scriptId, script, process.stderr)
            process.exit(1)
        }
        if (a.required && params.args[a.id] === undefined) {
            process.stderr.write(`Required argument "${a.id}" is missing\n`)
            printUsage(scriptId, script, process.stderr)
            process.exit(1)
        }
    })

    return params
}

