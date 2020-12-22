import { optionValDef, params, script, stringMap } from '../type'
import { getOptionIdent } from './getOptionIdent'
import { printError } from './printError'
import { printUsage } from './printUsage'

export function getParamsFromArgs(
    scriptId: string,
    script: script,
    argv: string[],
): params {
    const params: params = { options: {}, args: {}, variadic: [] }

    const required = (script.requiredArgs?.length ?? 0)
    let parseOptions = true
    for (let i = 0; i < argv.length; i++) {
        if (parseOptions && argv[i] === '--') {
            parseOptions = false

        } else if (parseOptions && argv[i] === '--help') {
            printUsage(scriptId, script, process.stdout)
            process.exit(0)

        } else if (parseOptions && argv[i][0] === '-') {
            i += readOptionArg(scriptId, script, argv, i, params)

        } else if (script.requiredArgs && Object.keys(params.args).length < required) {
            const arg = script.requiredArgs[Object.keys(params.args).length]
            params.args[arg.id] = argv[i]

        } else if (script.optionalArgs && Object.keys(params.args).length < required + script.optionalArgs.length) {
            const arg = (script.optionalArgs)[Object.keys(params.args).length]
            params.args[arg.id] = argv[i]

        } else if (script.variadicArgs) {
            params.variadic = params.variadic ?? []
            params.variadic.push(argv[i])

        } else {
            printError(scriptId, script, `Extraneous argument: ${argv[i]}`, true, true)
        }
    }

    return params
}

function readOptionArg(
    scriptId: string,
    script: script,
    argv: string[],
    index: number,
    params: params,
) {
    const options = script.options ?? {}
    const ids = Object.keys(options)

    if (argv[index].substr(0, 2) === '--') {
        for (const id of ids) {
            const long = getOptionIdent('long', id, options[id], false)

            if (long && argv[index].substr(2) === long) {
                if (options[id].value?.length) {
                    readOptionValue(id, '--' + long, argv.slice(index + 1))
                } else {
                    params.options[id] = true
                }

                return (options[id].value?.length ?? 0)
            }
        }
        printError(scriptId, script, `Unknown option "${argv[index]}"`, true, true)

    }

    for (let i = 1; i < argv[index].length; i++) {
        let found = false
        for (const id of ids) {
            const short = getOptionIdent('short', id, options[id], false)

            if (short && argv[index][i] === short) {
                if (options[id].value?.length) {
                    const argRest = argv[index].substr(i + 1)
                    readOptionValue(id, '-' + short, (argRest ? [argRest] : []).concat(argv.slice(index + 1)))

                    return (options[id].value?.length ?? 0)
                } else {
                    params.options[id] = true
                    found = true
                }
            }
        }
        if (!found) {
            printError(scriptId, script, `Unknown option "-${argv[index][i]}"`, true, true)
        }
    }

    return 0

    function readOptionValue(id: string, namedBy: string, argvSlice: string[]) {
        const valueIds = options[id].value as optionValDef[]
        const o: stringMap = {}
        valueIds.forEach((vId, i) => {
            if (argvSlice.length < i) {
                printError(scriptId, script, `Missing parameter ${i} "${valueIds[i]}" for option "${namedBy}"`, true, true)
            }
            o[vId] = argv[index + 1 + i]
        })
        if (options[id].multiple) {
            if (Array.isArray(params.options[id])) {
                (params.options[id] as stringMap[]).push(o)
            } else {
                params.options[id] = [o]
            }
        } else {
            params.options[id] = o
        }
    }
}
