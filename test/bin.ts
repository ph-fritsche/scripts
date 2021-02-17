import { argv, stdout, stderr } from 'process'
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

function wait(time = 2) {
    return new Promise(res => setTimeout(res, time))
}

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
        run: (args: string[]) => {
            argv.splice(0, argv.length, 'node-bin', 'yarn-scripts-command', ...args)
            chdir(exampleDir)
            bin()
        },
    }
}

it('list scripts', async () => {
    const { getOutput, getErrput, run } = setup()

    run([])

    await wait()

    expect(getErrput()).toBe('')
    expect(getOutput()).toEqual(expect.stringContaining('Available scripts:'))
})

it('debug config', async () => {
    const { getOutput, getErrput, run } = setup()

    run(['--debug-config'])

    await wait()

    expect(getErrput()).toBe('')
    expect(streamsMock.out).toBeCalled()
    expect(getOutput()).toMatch(/config:/i)
    expect(getOutput()).toMatch(/extends:/i)
    expect(getOutput()).toMatch(/scripts:/i)
    expect(getOutput()).toMatchSnapshot()
})

it('run "foo" from "package-a"', async () => {
    const { getOutput, getErrput, run } = setup()

    run(['foo'])

    await wait()

    expect(getErrput()).toBe('')
    expect(streamsMock.out).toBeCalledWith('foo')
    expect(getOutput()).toBe('foo')
})

it('run "foo --loud" from "package-a"', async () => {
    const { getOutput, getErrput, run } = setup()

    run(['foo', '--loud'])

    await wait()

    expect(getErrput()).toBe('')
    expect(getOutput()).toBe('FOO')
})
