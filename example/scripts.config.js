module.exports = {
    extends: [
        'package-b',
        'package-c',
    ],
    scripts: {
        'baz0': 'package-a/baz',
    },
}
