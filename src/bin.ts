import process from 'process'
import { run } from './'

export default (): Promise<void> => run(process.argv[2], process.argv.slice(3))
    .catch(code => {
        if (typeof (code) === 'number') {
            process.exit(code)
        } else {
            process.stderr.write(`Script "${process.argv[2]}" aborted with error:\n${String(code)}\n`)
            process.exit(2)
        }
    })
