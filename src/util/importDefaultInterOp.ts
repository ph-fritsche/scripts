import dynamicImport from './import'

export async function importDefault<T>(s: string): Promise<T> {
    return dynamicImport<T>(s).then(m => (m as {default?: T}).default ?? m)
}
