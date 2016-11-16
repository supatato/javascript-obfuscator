import { IOptions } from '../interfaces/IOptions';

export type TObfuscatorOptions = {
    [P in keyof IOptions]?: IOptions[P]
} & {
    [key: string]: any
}
