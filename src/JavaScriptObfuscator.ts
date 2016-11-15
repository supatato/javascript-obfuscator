import { TObfuscatorOptions } from './types/TObfuscatorOptions';

import { IObfuscationResult } from './interfaces/IObfuscationResult';

import { JavaScriptObfuscatorCLI } from './cli/JavaScriptObfuscatorCLI';
import { JavaScriptObfuscatorInternal } from './JavaScriptObfuscatorInternal';

export class JavaScriptObfuscator {
    /**
     * @param sourceCode
     * @param obfuscatorOptions
     * @returns {string}
     */
    public static obfuscate (sourceCode: string, obfuscatorOptions: TObfuscatorOptions = {}): IObfuscationResult {
        let javaScriptObfuscator: JavaScriptObfuscatorInternal = new JavaScriptObfuscatorInternal(
            sourceCode,
            obfuscatorOptions
        );

        javaScriptObfuscator.obfuscate();

        return javaScriptObfuscator.getObfuscationResult();
    }

    /**
     * @param argv
     */
    public static runCLI (argv: string[]): void {
        new JavaScriptObfuscatorCLI(argv).run();
    }
}
