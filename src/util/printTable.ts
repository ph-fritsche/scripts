export function printTable(stream: NodeJS.WriteStream, table: (string | undefined)[][]) {
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

    print.forEach(row => {
        row.forEach((col = '', i) => {
            if (i > 0) {
                stream.write('  ')
            }
            stream.write(col.padEnd(width[i]))
        })
        stream.write('\n')
    })
}
