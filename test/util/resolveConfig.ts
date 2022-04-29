import fs from 'fs'
import { resolveConfig } from '../../src/util'
import exampleImport from '../../example/import'
import dynamicImport from '../../src/util/import'

jest.mock('../../src/util/import', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const importMock = dynamicImport as unknown as jest.MockedFunction<typeof dynamicImport>

const exampleDir = fs.realpathSync(__dirname + '/../../example/')
const packageDirA = fs.realpathSync(exampleDir + '/node_modules/package-a')
const packageDirB = fs.realpathSync(exampleDir + '/node_modules/package-b')

beforeAll(() => {
    process.chdir(exampleDir)
})

beforeEach(() => {
    importMock.mockImplementation((module: string) => exampleImport(module))
})

it('resolve with empty scripts object if config does not exist', () => {
    const config = resolveConfig('non-existent-config.js')

    return expect(config).resolves.toEqual({
        configPath: expect.stringContaining('not found') as unknown,
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

it('resolve config from filename', () => {
    const config = resolveConfig('scripts.config.js')

    return expect(config).resolves.toEqual({
        configPath: exampleDir + '/scripts.config.js',
        extends: {
            'package-b': {
                'package-a': {},
            },
            'package-c': {},
        },
        scripts: expect.objectContaining({
            'bar': {
                configuredBy: ['package-b'],
                script: 'package-a/bar',
            },
            'baz': {
                configuredBy: ['package-b'],
                script: packageDirB + '/baz',
            },
            'foo': {
                configuredBy: ['package-b', 'package-a'],
                script: packageDirA + '/foo',
            },
        }) as unknown,
    })
})

it('resolve config object', () => {
    const config = {
        extends: [
            'package-b',
        ],
        scripts: {
            'foo': {
                run() { return },
            },
        },
    }

    return expect(resolveConfig(config)).resolves.toEqual({
        configPath: '[inline]',
        extends: {
            'package-b': {
                'package-a': {},
            },
        },
        scripts: expect.objectContaining({
            'bar': {
                configuredBy: ['package-b'],
                script: 'package-a/bar',
            },
            'baz': {
                configuredBy: ['package-b'],
                script: packageDirB + '/baz',
            },
            'foo': {
                configuredBy: [],
                script: config.scripts.foo,
            },
        }) as unknown,
    })
})
