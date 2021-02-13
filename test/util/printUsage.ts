import { config, script } from '../../src/type'
import { printMainUsage, printUsage } from '../../src/util'

function setup() {
    let output = ''
    const stream = { write: (c: string) => { output = output.concat(c) } }
    const print = (script: Partial<script>) => {
        output = ''
        printUsage('myScriptId', script as script, stream as NodeJS.WriteStream)
    }

    return { getOutput: () => output, print }
}

function setupMain() {
    let output = ''
    const stream = { write: (c: string) => { output = output.concat(c) } }
    const print = (config: Partial<config>) => {
        output = ''
        printMainUsage(config as config, stream as NodeJS.WriteStream)
    }

    return { getOutput: () => output, print }
}

it('print description', () => {
    const { getOutput, print } = setup()

    print({ description: 'this script does something' })
    expect(getOutput()).toMatch(/this script does something/)
})

it('print options', () => {
    const { getOutput, print } = setup()

    print({ options: { a: {description: 'some flag'}, foo: {description: 'bar', value: ['baz']} }})
    expect(getOutput()).toMatch(/-a +some flag/)
    expect(getOutput()).toMatch(/--foo +<baz> +bar/)
})

it('print required arguments', () => {
    const { getOutput, print } = setup()

    print({ requiredArgs: [ {id: 'foo', description: 'bar'}]})
    expect(getOutput()).toMatch(/myScriptId <foo>/)
    expect(getOutput()).toMatch(/<foo> +bar/)
})

it('print optional arguments', () => {
    const { getOutput, print } = setup()

    print({ optionalArgs: [ {id: 'foo', description: 'bar'}]})
    expect(getOutput()).toMatch(/myScriptId \[foo]/)
    expect(getOutput()).toMatch(/\[foo] +bar/)
})

it('print variadic arguments', () => {
    const { getOutput, print } = setup()

    print({ variadicArgs: {id: 'foo', description: 'bar'}})
    expect(getOutput()).toMatch(/myScriptId \[...foo]/)
    expect(getOutput()).toMatch(/\[...foo] +bar/)
})

it('list available scripts', () => {
    const { getOutput, print } = setupMain()

    print({scripts: {
        foo: 'package-foo',
        bar: 'package-bar',
    }})

    expect(getOutput()).toMatch(/foo\s+-->\s+package-foo/)
    expect(getOutput()).toMatch(/bar\s+-->\s+package-bar/)
})
