module.exports = {
    arguments: [
        { id: 'bit 1', description: 'first bit', required: true },
        { id: 'bit 2', description: 'second bit' },
    ],
    rest: {
        id: 'bits',
        description: 'Words to be echoed'
    },
    callback({rest}) {
        process.stdout.write('------------------ECHO\n')
        rest.forEach(v => process.stdout.write(`${v}\n`))
    }
}
