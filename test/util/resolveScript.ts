import type { streams } from '../../src/run'
import { resolveScript } from '../../src/util'
import exampleImport from '../../example/import'

jest.mock('../../src/util/import', () => ((module: string) => exampleImport(module)))

const exampleDir = __dirname.concat('/../../example/')

function setup() {
    let errput = ''
    return {
        getErrput: () => errput,
        streams: {
            err: {
                write: (c: string) => { errput = errput.concat(c) },
            },
        } as unknown as streams,
    }
}

it('resolve package', async () => {
    const { streams } = setup()

    const script = resolveScript(streams, {
        scripts: {
            a: 'package-b/echo',
        },
    }, 'a')

    return expect(script).resolves.toBe((await import(exampleDir.concat('node_modules/package-b/echo'))).default)
})

it('report error for undefined script', async () => {
    const { streams, getErrput } = setup()

    const script = resolveScript(streams, {
        scripts: {
            a: 'package-b/echo',
        },
    }, 'b')

    return expect(script).rejects.toBe(1).then(() => {
        expect(getErrput()).toMatch('"b" is not defined')
    })
})

it('report error if the (default) export has no run() method', () => {
    const { streams, getErrput } = setup()

    const script = resolveScript(streams, {
        scripts: {
            a: __dirname.concat('/resolveScript'),
        },
    }, 'a')

    return expect(script).rejects.toBe(1).then(() => {
        expect(getErrput()).toMatch('is invalid')
    })
})
