import fs from 'fs'
import { resolveConfig } from '../../src/util'
import exampleImport from '../../example/import'
import dynamicImport from '../../src/util/import'
import { stringify } from 'querystring'

jest.mock('../../src/util/import', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const importMock = dynamicImport as unknown as jest.MockedFunction<typeof dynamicImport>

const exampleDir = fs.realpathSync(__dirname + '/../../example/')
const packageDirA = fs.realpathSync(exampleDir + '/node_modules/package-a')
const packageDirB = fs.realpathSync(exampleDir + '/node_modules/package-b')
const packageDirC = fs.realpathSync(exampleDir + '/node_modules/package-c')

beforeAll(() => {
    process.chdir(exampleDir)
})

beforeEach(() => {
    importMock.mockImplementation((module: string) => exampleImport(module))
})

it('resolve with empty scripts object if config does not exist', () => {
    const config = resolveConfig('non-existent-config.js')

    return expect(config).resolves.toEqual({
        configPath: expect.stringContaining('not found'),
        extends: {},
        scripts: {},
    })
})

it('report error for circular reference', () => {
    importMock.mockImplementation(async (module: string): Promise<unknown> => {
        if (module === 'package-a') {
            return {
                'extends': [
                    // package-b already extends package-a
                    'package-b',
                ],
            }
        }
        return exampleImport(module)
    })

    const config = resolveConfig('scripts.config.js')
    return expect(config).rejects.toEqual(expect.stringMatching(/circular reference/i))
})

it('resolve extensions', () => {
    const config = resolveConfig('scripts.config.js')

    return expect(config).resolves.toEqual({
        configPath: exampleDir + '/scripts.config.js',
        extends: {
            'package-b': {
                'package-a': {},
            },
            'package-c': {},
        },
        scripts: {
            'baz0': {
                configuredBy: exampleDir + '/scripts.config.js',
                script: 'package-a/baz',
            },
            'echo': {
                configuredBy: 'package-b',
                script: packageDirB + '/echo',
            },
            'bar': {
                configuredBy: 'package-b',
                script: 'package-a/bar',
            },
            'baz': {
                configuredBy: 'package-b',
                script: packageDirB + '/baz',
            },
            'foo': {
                configuredBy: 'package-a',
                script: packageDirA + '/foo',
            },
            'foobar': {
                configuredBy: 'package-c',
                script: packageDirC + '/foobar',
            },
            'inline': {
                configuredBy: 'package-c',
                script: expect.objectContaining({ run: expect.any(Function) }),
            },
            'inline-require': {
                configuredBy: 'package-c',
                script: expect.objectContaining({ run: expect.any(Function) }),
            },
        },
    })
})
