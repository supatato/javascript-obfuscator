import { assert } from 'chai';

import { IObfuscationResult } from '../../../../../src/interfaces/IObfuscationResult';

import { NO_CUSTOM_NODES_PRESET } from '../../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../../helpers/readFileAsString';

import { JavaScriptObfuscator } from '../../../../../src/JavaScriptObfuscator';

describe('FunctionDeclarationTransformer', () => {
    let obfuscatedCode: string;

    describe('transformation of `functionDeclaration` node names', () => {
        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/input.js');
            const obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_CUSTOM_NODES_PRESET
                }
            );

            obfuscatedCode = obfuscationResult.getObfuscatedCode();
        });

        it('shouldn\'t transform function name if `functionDeclaration` parent block scope is a `ProgramNode`', () => {
            const functionNameIdentifierMatch: RegExpMatchArray|null = obfuscatedCode
                .match(/function *foo *\(\) *\{/);
            const functionCallIdentifierMatch: RegExpMatchArray|null = obfuscatedCode
                .match(/foo *\( *\);/);

            const functionParamIdentifierName: string = (<RegExpMatchArray>functionNameIdentifierMatch)[1];
            const functionBodyIdentifierName: string = (<RegExpMatchArray>functionCallIdentifierMatch)[1];

            assert.equal(functionParamIdentifierName, functionBodyIdentifierName);
        });

        it('should transform function name if `functionDeclaration` parent block scope is not a `ProgramNode`', () => {
            const functionNameIdentifierMatch: RegExpMatchArray|null = obfuscatedCode
                .match(/function *_0x[a-f0-9]{4,6} *\(\) *\{/);
            const functionCallIdentifierMatch: RegExpMatchArray|null = obfuscatedCode
                .match(/_0x[a-f0-9]{4,6} *\( *\);/);

            const functionParamIdentifierName: string = (<RegExpMatchArray>functionNameIdentifierMatch)[1];
            const functionBodyIdentifierName: string = (<RegExpMatchArray>functionCallIdentifierMatch)[1];

            assert.equal(functionParamIdentifierName, functionBodyIdentifierName);
        });
    });
});
