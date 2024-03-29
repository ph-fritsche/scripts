export * from './getParamsFromArgv'
export * from './printConfig'
export * from './printUsage'
export * from './resolveConfig'
export * from './resolveScript'

export interface WriteStream {
    write(text: string): void
}
