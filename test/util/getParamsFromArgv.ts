import { streams } from '../../src/run'
import { params, script } from '../../src/type'
import { getParamsFromArgv, printUsage } from '../../src/util'

jest.mock('../../src/util/printUsage', () => ({
    printUsage: jest.fn(),
}))
const printUsageMock = printUsage as jest.Mock<typeof printUsage>

function setup(script: Partial<script>) {
    const streams = {
        out: {
            write: jest.fn(),
        },
        err: {
            write: jest.fn(),
        },
    }

    const wrappedGetParamsFromArgv = (argv: string[]) => {
        streams.out.write.mockClear()
        streams.err.write.mockClear()
        printUsageMock.mockClear()
        return getParamsFromArgv(streams as unknown as streams, 'id', script as script, argv)
    }

    return { streams, wrappedGetParamsFromArgv }
}


it('get required arguments', () => {
    const { wrappedGetParamsFromArgv } = setup({
        requiredArgs: [
            {id: 'a'},
            {id: 'b'},
        ],
    })

    const params = wrappedGetParamsFromArgv(['foo', 'bar'])

    expect(params.args).toEqual({a: 'foo', b: 'bar'})
})

it('report error for missing required argument', () => {
    const script = {
        requiredArgs: [
            { id: 'a', description: 'A' },
            { id: 'b' },
        ],
    }
    const { streams, wrappedGetParamsFromArgv } = setup(script)

    expect(() => wrappedGetParamsFromArgv(['foo'])).toThrow('1')

    expect(streams.err.write).toHaveBeenCalledWith(expect.stringContaining(`Missing argument 1 "b"`))
    expect(printUsageMock).toBeCalledWith('id', script, streams.err)

    expect(() => wrappedGetParamsFromArgv([])).toThrow('1')

    expect(streams.err.write).toHaveBeenCalledWith(expect.stringContaining(`Missing argument 0 "A"`))
    expect(printUsageMock).toBeCalledWith('id', script, streams.err)
})

it('get optional arguments', () => {
    const { wrappedGetParamsFromArgv } = setup({
        requiredArgs: [
            { id: 'a' },
        ],
        optionalArgs: [
            { id: 'b' },
            { id: 'c' },
        ],
    })

    const params = wrappedGetParamsFromArgv(['foo', 'bar'])

    expect(params.args).toEqual({ a: 'foo', b: 'bar' })
})

it('report error for extraneous argument', () => {
    const { streams, wrappedGetParamsFromArgv } = setup({
        optionalArgs: [
            { id: 'a' },
        ],
    })

    expect(() => wrappedGetParamsFromArgv(['foo', 'bar'])).toThrow()

    expect(streams.err.write).toHaveBeenCalled()
})

it('get variadic arguments', () => {
    const { wrappedGetParamsFromArgv } = setup({
        optionalArgs: [
            { id: 'a' },
        ],
        variadicArgs: {id: 'b'},
    })

    const params = wrappedGetParamsFromArgv(['foo', 'bar', 'baz'])

    expect(params.variadic).toEqual(['bar', 'baz'])
})

it('get flag options', () => {
    const { wrappedGetParamsFromArgv } = setup({
        variadicArgs: {id: 'a'},
        options: {
            a: {},
            b: {short: 'x'},
            foo: {},
            bar: {long: 'baz'},
        },
    })
    let params: params
    params = wrappedGetParamsFromArgv(['foo', '-a', 'bar'])
    expect(params.options).toEqual({ a: true })

    params = wrappedGetParamsFromArgv(['foo', '-x', 'bar'])
    expect(params.options).toEqual({ b: true })

    params = wrappedGetParamsFromArgv(['foo', '-ax', 'bar'])
    expect(params.options).toEqual({ a: true, b: true })

    params = wrappedGetParamsFromArgv(['foo', '--foo', 'bar'])
    expect(params.options).toEqual({ foo: true })

    params = wrappedGetParamsFromArgv(['foo', '--baz', 'bar'])
    expect(params.options).toEqual({ bar: true })
})

it('get value options', () => {
    const { wrappedGetParamsFromArgv } = setup({
        variadicArgs: { id: 'a' },
        options: {
            a: {value: ['x', 'y']},
            foo: {value: ['x', 'y']},
        },
    })
    let params: params

    params = wrappedGetParamsFromArgv(['foo', '-a', 'bar', 'baz', 'foo'])
    expect(params.options).toEqual({ a: {x: 'bar', y: 'baz'} })

    params = wrappedGetParamsFromArgv(['foo', '-abar', 'baz', 'foo'])
    expect(params.options).toEqual({ a: {x: 'bar', y: 'baz'} })

    params = wrappedGetParamsFromArgv(['foo', '--foo', 'bar', 'baz', 'foo'])
    expect(params.options).toEqual({ foo: { x: 'bar', y: 'baz' } })
})

it('get multiple value options', () => {
    const { wrappedGetParamsFromArgv } = setup({
        variadicArgs: { id: 'a' },
        options: {
            a: { value: ['x'], multiple: true },
        },
    })
    let params: params

    params = wrappedGetParamsFromArgv(['foo', '-a', 'bar', 'baz', 'foo'])
    expect(params.options).toEqual({ a: [{x: 'bar'}] })

    params = wrappedGetParamsFromArgv(['foo', '-a', 'bar', 'baz', '-a', 'foo'])
    expect(params.options).toEqual({ a: [{x: 'bar'}, {x: 'foo'}] })
})

it('report error for unknown short option', () => {
    const script = {
        variadicArgs: { id: 'a' },
    }
    const { streams, wrappedGetParamsFromArgv } = setup(script)

    expect(() => wrappedGetParamsFromArgv(['foo', '-b', 'bar'])).toThrow('1')

    expect(streams.err.write).toHaveBeenCalledWith(expect.stringMatching(/unknown option "-b"/i))
    expect(printUsageMock).toHaveBeenCalledWith('id', script, streams.err)
})

it('report error for unknown long option', () => {
    const script = {
        variadicArgs: { id: 'a' },
        options: {
            a: {},
        },
    }
    const { streams, wrappedGetParamsFromArgv } = setup(script)

    expect(() => wrappedGetParamsFromArgv(['foo', '--b', 'bar'])).toThrow('1')

    expect(streams.err.write).toHaveBeenCalledWith(expect.stringMatching(/unknown option "--b"/i))
    expect(printUsageMock).toHaveBeenCalledWith('id', script, streams.err)
})

it('report error for missing option parameter', () => {
    const script = {
        variadicArgs: { id: 'a' },
        options: {
            a: { value: ['val0', 'val1']},
        },
    }
    const { streams, wrappedGetParamsFromArgv } = setup(script)

    expect(() => wrappedGetParamsFromArgv(['foo', '-a', 'bar'])).toThrow('1')

    expect(streams.err.write).toHaveBeenCalledWith(expect.stringMatching(/missing parameter 1 "val1" for option "-a"/i))
    expect(printUsageMock).toHaveBeenCalledWith('id', script, streams.err)
})

it('ignore options after "--"', () => {
    const { wrappedGetParamsFromArgv } = setup({
        variadicArgs: { id: 'a' },
        options: {
            a: {},
            b: {},
        },
    })

    const params = wrappedGetParamsFromArgv(['foo', '-a', '--', '-b', 'bar', 'baz'])
    expect(params.options).toEqual({ a: true })
})

it('print usage and report success when arguments include "--help"', () => {
    const script = {
        variadicArgs: { id: 'args' },
        options: {
            a: {},
        },
    }
    const { streams, wrappedGetParamsFromArgv } = setup(script)

    expect(() => wrappedGetParamsFromArgv(['foo', '-a', '--help', 'bar'])).toThrow('0')

    expect(printUsageMock).toBeCalledWith('id', script, streams.err)
})
