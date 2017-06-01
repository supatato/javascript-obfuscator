import { assert } from 'chai';

import { IObfuscationResult } from '../../../../../src/interfaces/IObfuscationResult';

import { NO_CUSTOM_NODES_PRESET } from '../../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../../helpers/readFileAsString';

import { JavaScriptObfuscator } from '../../../../../src/JavaScriptObfuscator';

describe('CatchClauseTransformer', () => {
    let obfuscatedCode: string;

    describe('changeControlFlow (catchClauseNode: ESTree.CatchClause): void', () => {
        const paramNameRegExp: RegExp = /catch *\((_0x([a-f0-9]){4,6})\) *\{/;
        const bodyParamNameRegExp: RegExp = /console\['log'\]\((_0x([a-f0-9]){4,6})\);/;

        before(() => {
            const obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
                readFileAsString(__dirname + '/fixtures/input.js'),
                {
                    ...NO_CUSTOM_NODES_PRESET
                }
            );

            obfuscatedCode = obfuscationResult.getObfuscatedCode();
        });

        it('should transform catch clause node', () => {
            assert.match(obfuscatedCode, paramNameRegExp);
            assert.match(obfuscatedCode, bodyParamNameRegExp);
        });

        it('catch clause arguments param name and param name in body should be same', () => {
            const firstMatchArray: RegExpMatchArray | null = obfuscatedCode.match(paramNameRegExp);
            const secondMatchArray: RegExpMatchArray | null = obfuscatedCode.match(bodyParamNameRegExp);

            const firstMatch: string | undefined = firstMatchArray ? firstMatchArray[1] : undefined;
            const secondMatch: string | undefined = secondMatchArray ? secondMatchArray[1] : undefined;

            assert.isOk(firstMatch);
            assert.isOk(secondMatch);
            assert.equal(firstMatch, secondMatch);
        });
    });

    describe('object pattern as parameter', () => {
        before(() => {
            const obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
                readFileAsString(__dirname + '/fixtures/object-pattern-as-parameter.js'),
                {
                    ...NO_CUSTOM_NODES_PRESET
                }
            );

            obfuscatedCode = obfuscationResult.getObfuscatedCode();
        });

        it('shouldn\'t transform function parameter object pattern identifier', () => {
            const functionParameterMatch: RegExp = /\} *catch *\(\{ *name *\}\) *\{/;
            const functionBodyMatch: RegExp = /return *name;/;

            assert.match(obfuscatedCode, functionParameterMatch);
            assert.match(obfuscatedCode, functionBodyMatch);
        });
    });
});
