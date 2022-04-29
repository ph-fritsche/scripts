import dynamicImport from '../../src/util/import'
import { importDefault } from '../../src/util/importDefaultInterOp'

jest.mock('../../src/util/import', () => ({
    __esModule: true,
    default: jest.fn(),
}))

test.each([
    ['esm with default', {
        default: {
            foo: 'bar',
        },
        bar: 123,
    }],
    ['esm without default', {
        foo: 'bar',
        bar: 123,
    }],
    ['cjs', {
        foo: 'bar',
        bar: 123,
    }],
    ['esm with default as cjs', {
        __esModule: true,
        bar: 123,
        default: {
            __esModule: true,
            bar: 123,
            default: {
                foo: 'bar',
            },
        },
    }],
    ['esm without default as cjs', {
        __esModule: true,
        foo: 'bar',
        bar: 123,
    }],
])('get default export or spread from import(): %s', (s, obj) => {
    (dynamicImport as jest.MockedFunction<typeof dynamicImport>).mockImplementation(() => Promise.resolve(obj))
    return expect(importDefault(s)).resolves.toEqual(expect.objectContaining({foo: 'bar'}))
})

test('fail with invalid module path', () => {
    (dynamicImport as jest.MockedFunction<typeof dynamicImport>).mockImplementation(() => Promise.reject('foo'))
    return expect(importDefault('nonExistingPath')).rejects.toBe('foo')
})
