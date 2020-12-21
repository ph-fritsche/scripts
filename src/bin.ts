import { run } from "./run"
import type { config } from "./type"

const defaultConfig: config = {
    scripts: {
        'rename': __dirname + '/scripts/rename',
    }
}

run(defaultConfig)
