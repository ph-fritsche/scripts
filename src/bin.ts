import process from 'process'
import { run } from './'

export default (): void => void run(process.argv[2], process.argv.slice(3))
    .catch(code => process.exit(typeof (code) === 'number' ? code : 2))
