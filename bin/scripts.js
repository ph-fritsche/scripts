#!/usr/bin/env node
const run = require('../dist/run').run

run(process.argv[2], process.argv.slice(3)).catch(code => process.exit(typeof (code) === 'number' ? code : 2))
