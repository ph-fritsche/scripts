import { resolvedConfig, script } from '../../src/type'
import { printMainUsage, printUsage } from '../../src/util'

function setup() {
    let output = ''
    const outStream = { write: (c: string) => { output = output.concat(c) } }
    return {
        getOutput: () => output,
        printUsageFor: (script: Partial<script>) => {
            output = ''
            printUsage(outStream, 'myScriptId', script as script)
        },
        printMainUsage: (config: resolvedConfig) => {
            output = ''
            printMainUsage(outStream, config)
        },
    }
}

it('print description', () => {
    const { getOutput, printUsageFor } = setup()

    printUsageFor({ description: 'this script does something' })
    expect(getOutput()).toMatch(/this script does something/)
})

it('print options', () => {
    const { getOutput, printUsageFor } = setup()

    printUsageFor({ options: { a: {description: 'some flag'}, foo: {description: 'bar', value: ['baz']} }})
    expect(getOutput()).toMatch(/-a +some flag/)
    expect(getOutput()).toMatch(/--foo +<baz> +bar/)
})

it('print required arguments', () => {
    const { getOutput, printUsageFor } = setup()

    printUsageFor({ requiredArgs: [ {id: 'foo', description: 'bar'}]})
    expect(getOutput()).toMatch(/myScriptId <foo>/)
    expect(getOutput()).toMatch(/<foo> +bar/)
})

it('print optional arguments', () => {
    const { getOutput, printUsageFor } = setup()

    printUsageFor({ optionalArgs: [ {id: 'foo', description: 'bar'}]})
    expect(getOutput()).toMatch(/myScriptId \[foo]/)
    expect(getOutput()).toMatch(/\[foo] +bar/)
})

it('print variadic arguments', () => {
    const { getOutput, printUsageFor } = setup()

    printUsageFor({ variadicArgs: {id: 'foo', description: 'bar'}})
    expect(getOutput()).toMatch(/myScriptId \[...foo]/)
    expect(getOutput()).toMatch(/\[...foo] +bar/)
})

it('list available scripts', () => {
    const { getOutput, printMainUsage } = setup()

    printMainUsage({
        configPath: 'any',
        extends: {},
        scripts: {
            foo: {
                configuredBy: ['any'],
                script: 'package-foo',
            },
            bar: {
                configuredBy: ['any'],
                script: 'package-bar',
            },
        },
    })

    expect(getOutput()).toMatch(/foo\s+-->\s+package-foo/)
    expect(getOutput()).toMatch(/bar\s+-->\s+package-bar/)
})
