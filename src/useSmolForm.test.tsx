import { act, renderHook } from '@testing-library/react-hooks';
import { randomInt } from 'crypto';
import useSmolForm from './useSmolForm';
import { DefaultBindProps, FormHookResult } from './types';
import { DEFAULT_VALUE } from './defaultBindAdapter';
// no need for now, as the debounce is off
// import { DEFAULT_CHANGE_WAIT } from './defaultBindAdapter';

// no need for now, as the debounce is off
// jest.useFakeTimers();

type TestEntity = {
    strValue: string,
    intValue: number,
    floatValue: number,
}
const curryChange = (
    boundProps: DefaultBindProps<TestEntity>,
) => (
    value: string,
) => act(
    () => {
        boundProps.onChange({
            target: { value },
        });
        // no need for now, as the debounce is off
        // jest.advanceTimersByTime(DEFAULT_CHANGE_WAIT);
    },
);

const getDisplayNValue = (
    key: keyof TestEntity,
    { current }
    : { current: FormHookResult<TestEntity, DefaultBindProps<TestEntity>>},
) => [
    current.bind(key).value,
    current.entity[key],
];

describe('hook: useSmolForm', () => {
    describe('bind: float', () => {
        it('should properly accept the entry 1.001', () => {
            const args = {};
            const { result } = renderHook(() => useSmolForm<TestEntity>(args));
            const { bind /* , emitFieldChange */ } = result.current;

            const boundProps = bind.float('floatValue');

            const write = curryChange(boundProps);

            // emitFieldChange({ target: { value: '1' } }, 'floatValue', { type: (v) => float(v) });
            write('1');
            const one = getDisplayNValue('floatValue', result);
            write('1.');
            const oneDot = getDisplayNValue('floatValue', result);
            write('1.0');
            const oneDotZero = getDisplayNValue('floatValue', result);
            write('1.00');
            const oneDotZeroZero = getDisplayNValue('floatValue', result);
            write('1.001');
            const oneDotZeroZeroOne = getDisplayNValue('floatValue', result);

            expect(one).toStrictEqual(['1', 1]);
            expect(oneDot).toStrictEqual(['1.', 1]);
            expect(oneDotZero).toStrictEqual(['1.0', 1]);
            expect(oneDotZeroZero).toStrictEqual(['1.00', 1]);
            expect(oneDotZeroZeroOne).toStrictEqual(['1.001', 1.001]);
        });

        it('should not accept letters', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result
                    .current
                    .bind
                    .float('floatValue'),
            );

            write('b');
            const value = getDisplayNValue('floatValue', result);

            expect(value).toStrictEqual([DEFAULT_VALUE, undefined]);
        });

        it('should only accept numbers', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result
                    .current
                    .bind
                    .float('floatValue'),
            );

            write('1');
            const firstEntry = getDisplayNValue('floatValue', result);
            write('1b');
            const secondEntry = getDisplayNValue('floatValue', result);
            write('12');
            const thirdEntry = getDisplayNValue('floatValue', result);

            expect(firstEntry).toStrictEqual(['1', 1]);
            expect(secondEntry).toStrictEqual(['1', 1]);
            expect(thirdEntry).toStrictEqual(['12', 12]);
        });

        it('should filter the decimal', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result
                    .current
                    .bind
                    .float('floatValue'),
            );

            write('1');
            const one = getDisplayNValue('floatValue', result);
            write('1.');
            const oneDot = getDisplayNValue('floatValue', result);
            write('1.');
            const oneDotDot = getDisplayNValue('floatValue', result);
            write('1.2');
            const OneDotTwo = getDisplayNValue('floatValue', result);
            write('1.2.');
            const OneDotTwoDot = getDisplayNValue('floatValue', result);

            expect(one).toStrictEqual(['1', 1]);
            expect(oneDot).toStrictEqual(['1.', 1]);
            expect(oneDotDot).toStrictEqual(['1.', 1]);
            expect(OneDotTwo).toStrictEqual(['1.2', 1.2]);
            expect(OneDotTwoDot).toStrictEqual(['1.2', 1.2]);
        });
    });

    describe('bind: int', () => {
        it('should not accept letters', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result
                    .current
                    .bind
                    .float('intValue'),
            );

            write('b');
            const value = getDisplayNValue('intValue', result);

            expect(value).toStrictEqual([DEFAULT_VALUE, undefined]);
        });

        it('should only accept numbers', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result
                    .current
                    .bind
                    .int('intValue'),
            );

            write('1');
            const one = getDisplayNValue('intValue', result);
            write('1b');
            const oneB = getDisplayNValue('intValue', result);
            write('12');
            const oneTwo = getDisplayNValue('intValue', result);

            expect(one).toStrictEqual(['1', 1]);
            expect(oneB).toStrictEqual(['1', 1]);
            expect(oneTwo).toStrictEqual(['12', 12]);
        });
    });

    describe('bind: nullable', () => {
        it('should have the value as null by default', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const state = [
                result.current.bind.nullable('strValue').value,
                result.current.entity.strValue,
            ];

            expect(state).toStrictEqual([null, undefined]);
        });

        it('should change the state when changing the value', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result.current.bind.nullable('strValue'),
            );

            const input = randomInt(255).toString();
            write(input);
            const state = getDisplayNValue('strValue', result);

            expect(state).toStrictEqual([input, input]);
        });
    });

    describe('bind', () => {
        it('should change the state when changing the value', () => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            const write = curryChange(
                result.current.bind('strValue'),
            );

            const input = randomInt(255).toString();
            write(input);
            const state = getDisplayNValue('strValue', result);

            expect(state).toStrictEqual([input, input]);
        });
    });

    describe('config', () => {
        describe('defaultValue', () => {
            it('should be the default value when the property from the entity is falsy', () => {
                const { result } = renderHook(() => useSmolForm<TestEntity>());

                const defaultValue = randomInt(255).toString();

                const state = [
                    result.current.bind({ strValue: { defaultValue } }).value,
                    result.current.entity.strValue,
                ];

                expect(state).toStrictEqual([defaultValue, undefined]);
            });
        });

        describe('shortcuts', () => {
            it('should set a parser when binding the key with a function', () => {
                const { result } = renderHook(() => useSmolForm<TestEntity>());

                const expectedValue = { target: { value: '0' } };
                const bindInput = { strValue: (e: unknown) => e };

                const { onChange } = result
                    .current.bind(bindInput);

                act(() => {
                    onChange(expectedValue);
                });

                const complexEntry = result.current.entity.strValue;

                expect(complexEntry).toBe(expectedValue);
            });

            it('should set the validators when binding the key with a function array', () => {
                const { result } = renderHook(() => useSmolForm<TestEntity>());

                const expectedError1 = randomInt(255).toString();
                const expectedError2 = randomInt(255).toString();
                const validator1 = () => expectedError1;
                const validator2 = () => expectedError2;

                const write = curryChange(
                    result
                        .current
                        .bind({ strValue: [validator1, validator2] }),
                );

                write('2');

                const [firstError, secondError] = result
                    .current
                    .errors
                    .strValue;

                expect(firstError).toBe(expectedError1);
                expect(secondError).toBe(expectedError2);
            });

            it('should set the value from the key string', () => {
                const expectedValue = randomInt(255);
                const entity = { intValue: expectedValue };
                const { result } = renderHook(() => useSmolForm<TestEntity>({ initial: entity }));

                const valueFound = result
                    .current
                    .bind('intValue')
                    .value as number;

                expect(valueFound).toBe(expectedValue);
            });

            it('should set the value from the key from the object', () => {
                const expectedValue = randomInt(255);
                const entity = { intValue: expectedValue };
                const { result } = renderHook(() => useSmolForm<TestEntity>({ initial: entity }));

                const valueFound = result
                    .current
                    .bind({ intValue: [] })
                    .value as number;

                expect(valueFound).toBe(expectedValue);
            });
        });
    });
});
