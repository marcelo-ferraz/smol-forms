import defaultAdapter, { DEFAULT_VALUE, muiAdapter } from './bindAdapters';
import { generateChars, GenFlags, TestEntity } from './test/helpers';
import {
    DisplayNValue, ValidationErrors,
} from './types';

describe('defaultAdapter', () => {
    let testEnt: DisplayNValue<TestEntity> = null;
    const noErrors: ValidationErrors<TestEntity> = {};

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

    it('should set DEFAULT_VALUE as the default value if nothing is informed', () => {
        const onChangeSpy = jest.fn();
        const selector = 'emptyValue';
        const props = defaultAdapter<TestEntity>({
            selector,
            cfg: null,
            entity: testEnt,
            fieldChangeHandler: onChangeSpy,
            validationErrors: noErrors,
        });

        expect(props.value).toBe(DEFAULT_VALUE);
    });

    it('should set a the default value if nothing is informed', () => {
        const onChangeSpy = jest.fn();
        const selector = 'emptyValue';
        const expectedDefault = generateChars(4, GenFlags.all);
        const cfg = { defaultValue: expectedDefault };
        const props = defaultAdapter<TestEntity>({
            cfg,
            selector,
            entity: testEnt,
            fieldChangeHandler: onChangeSpy,
            validationErrors: noErrors,
        });

        expect(props.value).toBe(expectedDefault);
    });

    it('should get the value from entity.display', () => {
        const onChangeSpy = jest.fn();
        const selector = 'strValue';
        const expectedValue = generateChars(4, GenFlags.all);
        testEnt.display[selector] = expectedValue;

        const props = defaultAdapter<TestEntity>({
            selector,
            cfg: null,
            entity: testEnt,
            fieldChangeHandler: onChangeSpy,
            validationErrors: noErrors,
        });

        expect(props.value).toBe(expectedValue);
    });

    it('should get the value from entity.value if display is not available', () => {
        const onChangeSpy = jest.fn();
        const selector = 'strValue';
        const expectedValue = testEnt.value[selector];

        const props = defaultAdapter<TestEntity>({
            selector,
            cfg: null,
            entity: testEnt,
            fieldChangeHandler: onChangeSpy,
            validationErrors: noErrors,
        });

        expect(props.value).toBe(expectedValue);
    });

    it('should return the proper properties', () => {
        const onChangeSpy = jest.fn();
        const expectedSelector = 'strValue';
        const expectedValue = testEnt.value[expectedSelector];
        const expectedHelperText = generateChars(4);
        const errors = { [expectedSelector]: expectedHelperText };

        const props = defaultAdapter<TestEntity>({
            selector: expectedSelector,
            cfg: null,
            entity: testEnt,
            fieldChangeHandler: onChangeSpy,
            validationErrors: errors,
        });

        expect(props).toStrictEqual({
            'data-key': expectedSelector,
            onChange: expect.anything(),
            value: expectedValue,
        });
    });

    describe('muiAdapter', () => {
        it('should return the proper properties', () => {
            const onChangeSpy = jest.fn();
            const expectedSelector = 'strValue';
            const expectedValue = testEnt.value[expectedSelector];
            const expectedHelperText = generateChars(4);
            const errors = { [expectedSelector]: expectedHelperText };
    
            const props = muiAdapter<TestEntity>({
                selector: expectedSelector,
                cfg: null,
                entity: testEnt,
                fieldChangeHandler: onChangeSpy,
                validationErrors: errors,
            });
    
            expect(props).toStrictEqual({
                name: expectedSelector,
                'data-key': expectedSelector,
                onChange: expect.anything(),
                error: true,
                helperText: expectedHelperText,
                value: expectedValue,
            });
        });
    });
});
