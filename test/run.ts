import { run } from '../src'
import { stdin, stdout, stderr } from 'process'
import { getParamsFromArgv, printConfig, printMainUsage, resolveConfig, resolveScript } from '../src/util'

jest.mock('process', () => ({
    argv: [],
    stdin: { read: jest.fn() } as unknown as NodeJS.ReadStream,
    stdout: { write: jest.fn() } as unknown as NodeJS.WriteStream,
    stderr: { write: jest.fn() } as unknown as NodeJS.WriteStream,
}))
jest.mock('../src/util', () => ({
    getParamsFromArgv: jest.fn(),
    printConfig: jest.fn(),
    printMainUsage: jest.fn(),
    resolveConfig: jest.fn(),
    resolveScript: jest.fn(),
}))
const utilMock = {
    getParamsFromArgv: getParamsFromArgv as jest.MockedFunction<typeof getParamsFromArgv>,
    printConfig: printConfig as jest.MockedFunction<typeof printConfig>,
    printMainUsage: printMainUsage as jest.MockedFunction<typeof printMainUsage>,
    resolveConfig: resolveConfig as jest.MockedFunction<typeof resolveConfig>,
    resolveScript: resolveScript as jest.MockedFunction<typeof resolveScript>,
}

type Resolve<T> = T extends PromiseLike<infer U> ? Resolve<U> : T

function setup({
    config = {
        configPath: '',
        extends: {},
        scripts: {},
    },
    params = {
        options: {},
        args: {},
        variadic: [],
    },
    script = {
        run: jest.fn(),
    },
}: {
    params?: Resolve<ReturnType<typeof getParamsFromArgv>>,
    config?: Resolve<ReturnType<typeof resolveConfig>>,
    script?: Resolve<ReturnType<typeof resolveScript>>,
} = {}) {
    jest.resetAllMocks()
    utilMock.getParamsFromArgv.mockImplementation(() => params)
    utilMock.resolveConfig.mockImplementation(() => Promise.resolve(config))
    utilMock.resolveScript.mockImplementation(() => Promise.resolve(script))

    return {
        params,
        config,
        script,
        run,
    }
}

test('resolve config', async () => {
    const { run } = setup()

    await expect(run()).rejects.toBe(0)

    expect(utilMock.resolveConfig).toBeCalledWith(undefined)

    const conf = {}
    await expect(run(undefined, [], conf)).rejects.toBe(0)

    expect(utilMock.resolveConfig).toBeCalledWith(conf)
})

test('print debug information on "--debug-config"', async () => {
    const { run, config } = setup()

    await expect(run('--debug-config')).rejects.toBe(0)

    expect(utilMock.printConfig).toBeCalledWith(config, stdout)
    expect(utilMock.resolveScript).not.toBeCalled()
})

test('print help if no scriptId is given', async () => {
    const { run, config } = setup()

    await expect(run()).rejects.toBe(0)

    expect(utilMock.printMainUsage).toBeCalledWith(config, stdout)
    expect(utilMock.resolveScript).not.toBeCalled()
})

test('print help if "--help" comes before scriptId', async () => {
    const { run, config } = setup()

    await expect(run('--help', ['anything'])).rejects.toBe(0)

    expect(utilMock.printMainUsage).toBeCalledWith(config, stdout)
    expect(utilMock.resolveScript).not.toBeCalled()
})

test('pass first argument as scriptId', async () => {
    const { run, config } = setup()

    await expect(run('foo', ['a', 'b', 'c'])).resolves.toBe(undefined)

    expect(utilMock.resolveScript).toBeCalledWith({in: stdin, out: stdout, err: stderr}, config.scripts, 'foo')
})

test('run script with resolved params', async () => {
    const { run, script, params } = setup()

    await expect(run('foo')).resolves.toBe(undefined)

    expect(script.run).toBeCalledWith(params)
})

test('await script', async () => {
    let a = false
    const { run } = setup({script: { run: () => new Promise(res => {
        setTimeout(() => {
            a = true
            res()
        }, 1)
    })}})

    await expect(run('foo')).resolves.toBe(undefined)

    expect(a).toBe(true)
})
