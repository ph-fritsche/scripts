import { argv, stdout, stderr, exit } from 'process'
import exampleImport from '../example/import'
import bin from '../src/bin'

jest.mock('process', () => ({
    argv: [],
    stdin: { read: jest.fn() } as unknown as NodeJS.ReadStream,
    stdout: { write: jest.fn() } as unknown as NodeJS.WriteStream,
    stderr: { write: jest.fn() } as unknown as NodeJS.WriteStream,
    exit: jest.fn(),
}))
const streamsMock = {
    out: stdout.write as jest.MockedFunction<typeof stdout.write>,
    err: stderr.write as jest.MockedFunction<typeof stderr.write>,
}

jest.mock('../src/util/import', () => ((module: string) => exampleImport(module)))

const exampleDir = __dirname + '/../example'
const chdir = jest.requireActual('process').chdir

function setup() {
    jest.resetAllMocks()
    let output = ''
    let errput = ''
    streamsMock.out.mockImplementation((str) => { output += str; return true })
    streamsMock.err.mockImplementation((str) => { errput += str; return true })

    return {
        getOutput: () => output,
        getErrput: () => errput,
        run: (...args: string[]) => {
            argv.splice(0, argv.length, 'node-bin', 'yarn-scripts-command', ...args)
            chdir(exampleDir)
            return bin()
        },
    }
}

it('list scripts', async () => {
    const { getOutput, getErrput, run } = setup()

    await run()

    expect(getErrput()).toBe('')
    expect(getOutput()).toEqual(expect.stringContaining('Available scripts:'))
})

it('debug config', async () => {
    const { getOutput, getErrput, run } = setup()

    await run('--debug-config')

    expect(getErrput()).toBe('')
    expect(streamsMock.out).toBeCalled()
    expect(getOutput()).toMatch(/config:/i)
    expect(getOutput()).toMatch(/extends:/i)
    expect(getOutput()).toMatch(/scripts:/i)
    expect(getOutput()).toMatchSnapshot()
})

it('run "foo" from "package-a"', async () => {
    const { getOutput, getErrput, run } = setup()

    await run('foo')

    expect(getErrput()).toBe('')
    expect(streamsMock.out).toBeCalledWith('foo')
    expect(getOutput()).toBe('foo')
})

it('run "foo --loud" from "package-a"', async () => {
    const { getOutput, getErrput, run } = setup()

    await run('foo', '--loud')

    expect(getErrput()).toBe('')
    expect(getOutput()).toBe('FOO')
})

it('exit with code from numeric rejection', async () => {
    const { getErrput, run } = setup()

    await run('exception', '--number')

    expect(exit).toBeCalledWith(123)
    expect(getErrput()).toMatch(/something went wrong/)
})

it('write non-numeric rejection to stderr', async () => {
    const { getErrput, run } = setup()

    await run('exception')

    expect(exit).toBeCalledWith(2)
    expect(getErrput()).toMatch(/this should not happen/)
})
