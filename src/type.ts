type resolvableName = string

export interface config {
    extends?: string[],
    scripts?: {
        [id: string]: resolvableName | script,
    },
}

interface extended {
    [k: string]: extended,
}

export interface resolvedConfig {
    configPath: string,
    extends: extended,
    scripts: {
        [id: string]: {
            configuredBy: string[],
            script: resolvableName | script,
        },
    },
}

export type optionDef = {
    short?: string | false,
    long?: string | false,
    description?: string,
    value?: optionValDef[],
    multiple?: boolean,
}

export type optionValDef = string

export type argumentDef = {
    id: string,
    description?: string,
}

export type stringMap = {
    [k: string]: string
}

export type params = {
    options: {
        [id: string]: boolean | string | string[] | stringMap | stringMap[],
    }
    args: {
        [id: string]: string,
    }
    variadic: string[],
}

export interface script {
    description?: string,
    options?: {
        [k: string]: optionDef,
    }
    requiredArgs?: argumentDef[],
    optionalArgs?: argumentDef[],
    variadicArgs?: argumentDef,
    run: (params: params) => void | Promise<void>,
}
