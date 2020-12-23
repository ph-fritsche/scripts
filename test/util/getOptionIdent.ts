import { getOptionIdent } from '../../src/util/getOptionIdent'

it('return correct identifier', () => {
    expect(getOptionIdent('short', 'f', {}, false)).toBe('f')
    expect(getOptionIdent('short', 'f', {}, true)).toBe('-f')
    expect(getOptionIdent('short', 'f', {short: 'x'}, true)).toBe('-x')
    expect(getOptionIdent('short', 'f', {short: false}, true)).toBe(undefined)
    expect(getOptionIdent('short', 'foo', {}, true)).toBe(undefined)

    expect(getOptionIdent('long', 'foo', {}, false)).toBe('foo')
    expect(getOptionIdent('long', 'foo', {}, true)).toBe('--foo')
    expect(getOptionIdent('long', 'foo', {long: 'x'}, true)).toBe('--x')
    expect(getOptionIdent('long', 'foo', {long: false}, true)).toBe(undefined)
    expect(getOptionIdent('long', 'f', {}, true)).toBe(undefined)
})
