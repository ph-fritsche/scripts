const { stdout } = require('process')

module.exports = {
    extends: [
        'package-b',
        'package-c',
    ],
    scripts: {
        'baz0': 'package-a/baz',
        'inline-main': {
            run() {
                stdout.write('Hello, World!')
            },
        },
    },
}
