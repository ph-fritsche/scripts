import type { WriteStream } from '.'

export function printTable(
    stream: WriteStream,
    table: (string | undefined)[][],
): void {
    const width: number[] = []
    const print: string[][] = []
    table.forEach(row => {
        const rowIndex = print.length
        row.forEach((col = '', i) => {
            col.split('\n').forEach((line, j) => {
                width[i] = Math.max(width[i] ?? 0, line.length)
                print[rowIndex + j] = print[rowIndex + j] ?? []
                print[rowIndex + j][i] = line
            })
        })
    })

    const cols = Math.max(...print.map(r => r.length))
    print.forEach(row => {
        for (let i = 0; i < cols; i++) {
            if (i > 0) {
                stream.write('  ')
            }
            stream.write((row[i] ?? '').padEnd(width[i]))
        }
        stream.write('\n')
    })
}
