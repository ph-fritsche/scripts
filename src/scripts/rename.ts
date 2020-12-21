import fs from 'fs'
import process from 'process'
import type { params, script } from '../type'

const script: script = {
    options: [
        {id: '-in', description: 'Directory where files should be renamed', values: ['dir']},
        {id: '-i', description: 'Case-Insensitive'},
        {id: '-r', description: 'Include sub-directories'},
        {id: '-dry', description: 'Dry run'}
    ],
    args: [
        {id: 'search', description: 'Regexp search pattern', required: true},
        {id: 'replace', description: 'Replacement', required: true},
    ],
    run(params: params) {
        if (typeof (params.options['-in']) === 'string') {
            process.chdir(params.options['-in'])
        }

        const regexp = new RegExp(params.args.search, [
            params.options['-i'] && 'i'
        ].filter(Boolean).join(''))

        mvRegExp()

        function mvRegExp() {
            const cwd = process.cwd()
            const d = fs.readdirSync('.')

            for (const f of d) {
                if (fs.lstatSync(f).isDirectory()) {
                    if (params.options['-r']) {
                        process.chdir(f)
                        mvRegExp()
                        process.chdir(cwd)
                    }
                    continue
                }

                const newName = f.replace(regexp, params.args.replace)

                if (newName !== f) {
                    process.stdout.write(`${f} => ${newName}\n`)
                    if (!params.options['-dry']) {
                        fs.renameSync(f, newName)
                    }
                }
            }
        }
    },
}
export default script
