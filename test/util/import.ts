import dynamicImport from '../../src/util/import'

it('import module', async () => {
    const a = await dynamicImport('../../src/util/import')
    const b = await import('../../src/util/import')

    expect(a).toBe(b)
})
