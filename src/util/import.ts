// eslint-disable-next-line @typescript-eslint/no-explicit-any -- return of import statement is typed as Promise<any>
export default (s: string): Promise<any> => import(s)
