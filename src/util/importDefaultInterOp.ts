import dynamicImport from './import'

export async function importDefault<T>(s: string): Promise<T> {
    let obj = await dynamicImport(s)

    if (obj && typeof obj === 'object' && 'default' in obj) {
        do {
            obj = (obj as {default: unknown}).default
        } while (obj && typeof obj === 'object' && '__esModule' in obj)
    }

    return obj as T
}
