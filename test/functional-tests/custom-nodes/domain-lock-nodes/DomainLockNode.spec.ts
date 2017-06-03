import { assert } from 'chai';

import { IObfuscationResult } from '../../../../src/interfaces/IObfuscationResult';

import { NO_CUSTOM_NODES_PRESET } from '../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../helpers/readFileAsString';

import { JavaScriptObfuscator } from '../../../../src/JavaScriptObfuscator';

describe('DomainLockNode', () => {
    const regExp: RegExp = /var _0x([a-f0-9]){4,6} *= *new RegExp/;

    describe('`domainLock` option is set', () => {
        let obfuscatedCode: string;

        before(() => {
            const obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
                readFileAsString(__dirname + '/fixtures/simple-input.js'),
                {
                    ...NO_CUSTOM_NODES_PRESET,
                    domainLock: ['.example.com']
                }
            );

            obfuscatedCode = obfuscationResult.getObfuscatedCode();
        });

        it('should correctly append custom node into the obfuscated code', () => {
            assert.match(obfuscatedCode, regExp);
        });
    });

    describe('`domainLock` option isn\'t set', () => {
        let obfuscatedCode: string;

        before(() => {
            const obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
                readFileAsString(__dirname + '/fixtures/simple-input.js'),
                {
                    ...NO_CUSTOM_NODES_PRESET,
                    domainLock: []
                }
            );

            obfuscatedCode = obfuscationResult.getObfuscatedCode();
        });

        it('shouldn\'t append custom node into the obfuscated code', () => {
            assert.notMatch(obfuscatedCode, regExp);
        });
    });
});
