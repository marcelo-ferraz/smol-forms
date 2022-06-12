import binderFactory from './binderFactory';
import { generateChars, GenFlags, TestEntity } from './test/helpers';
import {
    BindAdapter, BindArgs, MuiBindProps, DisplayNValue, ValidationErrors,
} from './types';

import defaultBindAdapter from './bindAdapters';
import { int, float } from './inputTypes';

jest.mock('./bindAdapters.ts', () => {
    const original = jest.requireActual('./bindAdapters');
    return {
        __esModule: true,
        default: jest.fn(original.default),
    };
});

jest.mock('./inputTypes.ts', () => {
    const original = jest.requireActual('./inputTypes');
    return {
        __esModule: true,
        int: jest.fn(original.int),
        float: jest.fn(original.float),
    };
});

describe('binderFactory', () => {
    let testEnt: DisplayNValue<TestEntity> = null;
    const noErrors: ValidationErrors<TestEntity> = {};
    const noAdapter: BindAdapter<TestEntity, MuiBindProps<TestEntity>> = null;

    beforeEach(() => {
        testEnt = {
            value: {
                id: generateChars(4, GenFlags.all),
                strValue: generateChars(4, GenFlags.all),
                intValue: Number.parseInt(generateChars(4, GenFlags.numbers), 10),
                floatValue: Number.parseInt(generateChars(4, GenFlags.numbers), 10),
            },
            display: {},
        };
    });

    describe('bind', () => {
        it('should call the defaultAdapter with the proper args', () => {
            const onChangeSpy = jest.fn();
            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, noAdapter, onChangeSpy);

            const expectedSelector = 'id';
            bind(expectedSelector);

            expect(defaultBindAdapter).toHaveBeenCalledWith({
                cfg: null,
                entity: testEnt,
                fieldChangeHandler: onChangeSpy,
                selector: expectedSelector,
                validationErrors: noErrors,
            });
        });
        it('should call the custom adapter with the right args', () => {
            const onChangeSpy = jest.fn();
            const customAdapter = jest.fn();
            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, customAdapter, onChangeSpy);

            const expectedSelector = 'id';
            bind(expectedSelector);

            expect(customAdapter).toHaveBeenCalledWith({
                cfg: null,
                entity: testEnt,
                fieldChangeHandler: onChangeSpy,
                selector: expectedSelector,
                validationErrors: noErrors,
                bind: expect.anything(),
            });
        });
    });

    describe('bind.int', () => {
        it('should call the defaultAdapter with the proper args', () => {
            const onChangeSpy = jest.fn();
            const expectedSelector = 'intValue';

            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, noAdapter, onChangeSpy);

            bind.int(expectedSelector);

            expect(defaultBindAdapter).toHaveBeenCalledWith({
                cfg: expect.any(Object),
                entity: testEnt,
                fieldChangeHandler: onChangeSpy,
                selector: expectedSelector,
                validationErrors: noErrors,
            });
        });
        it('should set the type to use int', () => {
            const onChangeSpy = jest.fn();
            const input = generateChars(4, GenFlags.all);
            const selector = 'intValue';

            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, noAdapter, onChangeSpy);

            bind.int(selector);

            const [firstCallArgs] = (defaultBindAdapter as jest.Mock).mock.calls;

            const { cfg } = firstCallArgs[0] as BindArgs<TestEntity>;

            cfg.type(input, null, null);

            expect(int).toBeCalled();

            // (defaultBindAdapter as jest.SpiedFunction<int>).mock.calls
            // bind.int('intValue');
            // bind.float('floatValue');
            // bind.nullable('floatValue');
        });
    });
    describe('bind.float', () => {
        it('should call the defaultAdapter with the proper args', () => {
            const onChangeSpy = jest.fn();
            const expectedSelector = 'intValue';

            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, noAdapter, onChangeSpy);

            bind.int(expectedSelector);

            expect(defaultBindAdapter).toHaveBeenCalledWith({
                cfg: expect.any(Object),
                entity: testEnt,
                fieldChangeHandler: onChangeSpy,
                selector: expectedSelector,
                validationErrors: noErrors,
            });
        });

        it('should set the type to use float', () => {
            const onChangeSpy = jest.fn();
            const input = generateChars(4, GenFlags.all);
            const selector = 'floatValue';

            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, noAdapter, onChangeSpy);

            bind.float(selector);

            const [firstCallArgs] = (defaultBindAdapter as jest.Mock).mock.calls;

            const { cfg } = firstCallArgs[0] as BindArgs<TestEntity>;

            cfg.type(input, null, null);

            expect(float).toBeCalled();
        });
    });
    describe('bind.nullable', () => {
        it('should set the default value to null', () => {
            const onChangeSpy = jest.fn();
            const selector = 'id';

            const bind = binderFactory<
                TestEntity,
                MuiBindProps<TestEntity>
            >(testEnt, noErrors, noAdapter, onChangeSpy);

            bind.nullable(selector);

            const [firstCallArgs] = (defaultBindAdapter as jest.Mock).mock.calls;

            const { cfg } = firstCallArgs[0] as BindArgs<TestEntity>;

            expect(cfg.defaultValue).toBe(null);
        });
    });
});
