type resolvableName = string

export interface config {
    extends?: string[],
    scripts?: {
        [id: string]: resolvableName,
    },
}

export type optionDef = {
    id: string,
    description?: string,
    values?: optionValDef[],
    required?: boolean,
}

export type optionValDef = string

export type argumentDef = {
    id: string,
    description?: string,
    required?: boolean,
}

export type params = {
    options: {
        [id: string]: boolean | string | string[],
    }
    args: {
        [id: string]: string,
    }
    rest: string[],
}

export interface script {
    description?: string,
    options?: optionDef[],
    args?: argumentDef[],
    rest?: argumentDef,
    run: (params: params) => void,
}
