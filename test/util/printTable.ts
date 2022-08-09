import { printTable } from '../../src/util/printTable'

it('print table', () => {
    let output = ''

    printTable({
        write: (c: string) => { output = output.concat(c) },
    }, [
        [undefined, 'foo', 'bar\nbaz'],
        ['a', undefined, 'b', 'c'],
    ])

    expect(output).toBe([
        '   foo  bar   ',
        '        baz   ',
        'a       b    c',
    ].join('\n').concat('\n'))
})
