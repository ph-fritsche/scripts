import { resolveConfig } from '../../src/util/resolveConfig'

it('resolve with empty object if config does not exist', async () => {
    const config = await resolveConfig('non-existent-config.js')

    expect(config).toEqual({})
})
