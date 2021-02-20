[![action-release](https://img.shields.io/static/v1?logo=github-actions&logoColor=cyan&label=%F0%9F%9A%80&message=action-release&color=cyan)](https://github.com/ph-fritsche/action-release/)

# shared-scripts

Convenience tool to share scripts across multiple repositories.

---

Inspired by [kcd-scripts](https://github.com/kentcdodds/kcd-scripts/) and [eslint's sharable config](https://eslint.org/docs/user-guide/configuring#using-a-shareable-configuration-package).

---

Integrating setup configurations into the codebase comes at a cost:
The repositories are splattered with configuration files (eslintrc, jest.config, package.json, etc.).

While this allows to tailor the setup to the needs of the software,
it usually leads to copying a bunch of configuration directives.
They might be thought through at first, but often enough they end up being just there because "at some point someone considered it necessary and I don't want to change a running system" - and actually maintaining them seems just cumbersome.

We try to keep our code lean, and so we should strive for the same regarding our configurations.

---

[react-scripts](https://github.com/facebook/create-react-app) and others try to solve this with a 'one-fits-all' approach moving the necessary configuration into this package so that consuming packages end up just with the dependency for `react-scripts` or similiar.
By updating this dependency all embedded configurations are automatically updated too.

[kcd-scripts](https://github.com/kentcdodds/kcd-scripts/) provides an interesting solution working with plugged in configurations but "it's really specific to [the authors] needs".

[eslint](https://eslint.org/) allows to set up a shared configuration and extending it in multiple repositories of similar needs.

---

Taking eslint's approach of shareable configurations this package provides the command-line utility to extend/overwrite/wrap other scripts and reuse them across multiple repositories.


## Installation

```
$ yarn add --dev shared-scripts
```

## Usage

Set up a `scripts.config.js` that exports config like:
```js
module.exports = {
    extends: [
        // reference other configs by require-resolvable names ...
    ],
    scripts: {
        // reference scripts by require-resolvable names ...
        'foo': '@myNamespace/myScriptCollection/foo',
        'echo': __dirname + '/myScript',
        // or define them inline
        'echo': require('./myScript'),
    },
}
```

Run one of the scripts on the command line:
```js
$ yarn scripts foo
```

### Options

`$ yarn scripts --help` prints available scripts
`$ yarn scripts --debug-config` displays information about the resolved config
`$ yarn scripts foo --help` prints the options for script `foo`

## Scripts

```js
// ./myScript.js
module.exports = {
    description: 'Example script that echoes its arguments',
    variadicArgs: {
        description: 'Lines',
    },
    run(params) {
        params.variadicArgs.forEach(l => process.stdout.write(`${l}\n`))
    },
}
```

### Options

```js
    options: {
        foo: {
            description: 'Available as --foo flag',
        },
        bar: {
            description: 'Available as --baz and -b flag',
            long: 'baz',
            short: 'b',
        },
        p: {
            description: 'This one is -p followed by two values',
            values: ['x', 'y'],
        },
    },
```
The script can access the command line options as e.g. `params.options.p.x`

### Arguments

```js
    requiredArgs: [
        {
            id: 'foo',
            description: 'This one is required.',
        },
    ],
    optionalArgs: [
        {
            id: 'bar',
            description: 'This one can be omitted.',
        }
    ],
```
The script can access the command line arguments as e.g. `params.args.foo`.

#### Variadic arguments

```js
    variadicArgs: {
        id: 'extra',
        description: 'This allows more arguments to be passed',
    },
```
Variadic Arguments are available as `params.variadicArgs`.

### Exit code

If the `run` function of a script throws the script will exit with either the value of that throw if it is a number - or `2` otherwise.
