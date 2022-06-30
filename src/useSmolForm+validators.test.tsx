import { renderHook } from '@testing-library/react-hooks';
import { randomInt } from 'crypto';
import cases from 'jest-in-case';
import { muiAdapter } from './bindAdapters';
import {
    changeFromBind, blurFromBind, generateChars, generateFloat, generateInt, TestEntity, trigger, DELAY_PLUS_PADDING,
} from './test/helpers';
import { Validator } from './types';
import useSmolForm from './useSmolForm';
import {
    DEFAULT_EMAIL_MSG, DEFAULT_FLOAT_MSG, DEFAULT_GENERIC_MSG, DEFAULT_INT_MSG, DEFAULT_REQUIRED_MSG, isEmail, isFloat, isInt, isRequired, pattern, regexes,
} from './validators';

jest.useFakeTimers();

type TestArgs = {
    value?: string;
    selector?: keyof TestEntity;
    validator: Validator<TestEntity> | Validator<TestEntity>[];
    msg?: string;
};

describe('integration: useSmolForm hook + validators', () => {
    cases(
        'Validators', ({
            value, selector = 'strValue', validator, msg = null,
        }: TestArgs) => {
            const { result } = renderHook(() => useSmolForm<TestEntity>());

            changeFromBind(
                result.current.bind({ [selector]: [validator] }),
                value,
            );

            blurFromBind(
                result.current.bind({ [selector]: [validator] }),
            );

            const error = result.current.errors[selector];

            expect(error).toStrictEqual(msg ? [msg] : undefined);
        }, {
            'isRequired > valid value': {
                value: generateChars(255),
                validator: isRequired,
            },
            'isRequired > empty value': {
                value: ' ',
                validator: isRequired,
                msg: DEFAULT_REQUIRED_MSG,
            },
            'isRequired > null value': {
                value: null,
                validator: isRequired,
                msg: DEFAULT_REQUIRED_MSG,
            },
            'isRequired > undefined value': {
                value: undefined,
                validator: isRequired,
                msg: DEFAULT_REQUIRED_MSG,
            },
            'isInt > valid value': {
                value: generateInt(255).toString(),
                validator: isInt,
            },
            'isInt > invalid value': {
                value: generateChars(255),
                validator: isInt,
                msg: DEFAULT_INT_MSG,
            },
            'isFloat > valid value': {
                value: generateFloat().toString(),
                validator: isFloat(2),
            },
            'isFloat > invalid value': {
                value: generateChars(255),
                validator: isFloat(2),
                msg: DEFAULT_FLOAT_MSG,
            },
            'pattern > valid value': {
                value: generateChars(255),
                validator: pattern(/^\w+$/),
            },
            'pattern > invalid value': {
                value: generateChars(255),
                validator: pattern(regexes.isInt),
                msg: DEFAULT_GENERIC_MSG,
            },
            'isEmail > valid value': {
                value: `${generateChars(10)}@${generateChars(5)}.com`,
                validator: isEmail,
            },
            'isEmail > invalid value': {
                value: generateChars(255),
                validator: isEmail,
                msg: DEFAULT_EMAIL_MSG,
            },
        },
    );

    it('should have only one error message even if write invalid values multiple times', () => {
        const { result } = renderHook(() => useSmolForm<TestEntity>());

        const expectedValue = ' ';
        const selector = 'strValue';
        const expectedError = [DEFAULT_REQUIRED_MSG];

        const validator = isRequired;

        for (let i = 0; i < randomInt(10); i += 1) {
            changeFromBind(
                result.current.bind({ [selector]: [validator] }),
                expectedValue,
            );

            blurFromBind(
                result.current.bind({ [selector]: [validator] }),
            );
            jest.advanceTimersByTime(DELAY_PLUS_PADDING);
        }

        const error = result.current.errors[selector];

        expect(error).toStrictEqual(expectedError);
    });

    it('should have only one error message per validator even if write invalid values multiple times', () => {
        const { result } = renderHook(() => useSmolForm<TestEntity>({ delay: 0 }));

        const expectedValue = generateChars(10);
        const selector = 'strValue';
        const expectedError = [
            DEFAULT_FLOAT_MSG,
            DEFAULT_INT_MSG,
        ];

        const validators = [
            isFloat(2),
            isInt,
        ];

        for (let i = 0; i < randomInt(10); i += 1) {
            changeFromBind(
                result.current.bind({ [selector]: validators }),
                expectedValue,
            );

            blurFromBind(
                result.current.bind({ [selector]: validators }),
            );

            jest.advanceTimersByTime(500);
        }

        const error = result.current.errors[selector];

        expect(error).toStrictEqual(expectedError);
    });

    it('should save the state and render the errors on the helper text', () => {
        const { result } = renderHook(() => useSmolForm<TestEntity>({
            adapter: muiAdapter,
        }));

        const selector = 'strValue';

        const expectedValue = randomInt(255).toString();

        const validator = () => expectedValue;

        const bindInput = { [selector]: { validators: [validator] } };

        changeFromBind(
            result.current.bind({ [selector]: [validator] }),
            expectedValue,
        );

        blurFromBind(
            result.current.bind({ [selector]: [validator] }),
        );

        const errorFromState = result.current.errors.strValue;
        const { helperText } = result.current.bind(bindInput);

        expect(errorFromState).toStrictEqual([expectedValue]);
        expect(helperText).toStrictEqual([expectedValue]);
    });
});
