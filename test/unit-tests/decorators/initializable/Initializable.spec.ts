import { assert } from 'chai';

import { initializable } from '../../../../src/decorators/Initializable';
import { IInitializable } from '../../../../src/interfaces/IInitializable';

describe('@initializable', () => {
    describe('initializable (initializeMethodKey: string): any', () => {
        describe('property was initialized', () => {
            const testFunc: () => void = () => {
                class Foo implements IInitializable {
                    @initializable()
                    public property: string;

                    public initialize (property: string): void {
                        this.property = property;
                    }
                }

                const foo: Foo = new Foo();

                foo.initialize('baz');

                foo.property;
            };

            it('shouldn\'t throws an errors if property was initialized', () => {
                assert.doesNotThrow(testFunc, Error);
            });
        });

        describe('custom initialization method name is passed', () => {
            const testFunc: () => void = () => {
                class Foo implements IInitializable {
                    @initializable()
                    public property: string;

                    public initialize (): void {
                    }

                    public bar (property: string): void {
                        this.property = property;
                    }
                }

                const foo: Foo = new Foo();

                foo.bar('baz');

                foo.property;
            };

            it('shouldn\'t throws an errors if custom initialization method name is passed', () => {
                assert.doesNotThrow(testFunc, Error);
            });
        });

        describe('property didn\'t initialized', () => {
            const testFunc: () => void = () => {
                class Foo implements IInitializable {
                    @initializable()
                    public property: string;

                    public initialize (property: string): void {
                    }
                }

                const foo: Foo = new Foo();

                foo.initialize('baz');

                foo.property;
            };

            it('should throws an error if property didn\'t initialized', () => {
                assert.throws(testFunc, /Property `property` is not initialized/);
            });
        });

        describe('`initialize` method with custom name', () => {
            const testFunc: () => void = () => {
                class Foo {
                    @initializable('bar')
                    public property: string;

                    public initialize (property: string): void {
                        this.property = property;
                    }
                }

                const foo: Foo = new Foo();

                foo.initialize('baz');

                foo.property;
            };

            it('should throws an error if `initialize` method with custom name wasn\'t found', () => {
                assert.throws(testFunc, /method with initialization logic not found/);
            });
        });
    });
});
