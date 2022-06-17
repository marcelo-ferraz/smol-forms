/* eslint-disable no-bitwise */
import { FireObject, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { FormHookResult, MuiBindProps } from 'src/types';

export const GenFlags = {
    all: 0,
    lowerCaseLetters: 1,
    upperCaseLetters: 2,
    numbers: 4,
    specialChars: 8,
};

export const generateChars = (
    len: number,
    flags: number = GenFlags.lowerCaseLetters,
): string => {
    let content = '';

    if (!flags || flags & GenFlags.lowerCaseLetters) {
        content += 'a-z';
    }

    if (!flags || flags & GenFlags.upperCaseLetters) {
        content += 'A-Z';
    }

    if (!flags || flags & GenFlags.numbers) {
        content += '0-9';
    }

    if (!flags || flags & GenFlags.specialChars) {
        content += '!@#$%^&*()_+\\-=\\[\\]{};\':"\\|,\\.<>\\/?';
    }

    const reg = new RegExp(`[^${content}]+`, 'g');

    return Math.random().toString(36).replace(reg, '').substring(0, len);
};

export const generateInt = (len = 4) => Number.parseInt(
    generateChars(len, GenFlags.numbers),
    10,
);

export const generateFloat = () => Number.parseFloat(
    `${generateChars(4, GenFlags.numbers)}.${generateChars(2, GenFlags.numbers)}`,
);

export type TestEntity = Partial<{
    id: string;
    strValue: string,
    intValue: number,
    floatValue: number,
    emptyValue: unknown,
}>;

export const changeFromBind = (
    boundProps: MuiBindProps<TestEntity>,
    value: string,
) => act(
    () => {
        boundProps.onChange({
            target: { value },
        });
        jest.advanceTimersByTime(500);
        jest.runAllTimers();
    },
);

export const blurFromBind = (
    boundProps: MuiBindProps<TestEntity>,
) => act(
    () => {
        boundProps.onBlur();
    },
);

export const trigger = {
    change: (
        element: Parameters<FireObject['change']>[0],
        options: Parameters<FireObject['change']>[1],
    ) => act(
        () => {
            fireEvent.change(element, options);

            jest.advanceTimersByTime(500);
            jest.runAllTimers();
        },
    ),
    blur: (
        element: Parameters<FireObject['blur']>[0],
        options: Parameters<FireObject['blur']>[1],
    ) => act(
        () => {
            fireEvent.blur(element, options);

            jest.advanceTimersByTime(500);
            jest.runAllTimers();
        },
    ),
};

export const getDisplayNValue = (
    key: keyof TestEntity,
    { current }
    : { current: FormHookResult<TestEntity, MuiBindProps<TestEntity>>},
) => [
    current.bind(key).value,
    current.entity[key],
];

export const getDebouncedDisplayNValue = (
    key: keyof TestEntity,
    { current }
    : { current: FormHookResult<TestEntity, MuiBindProps<TestEntity>>},
) => {
    jest.runAllTimers();
    jest.advanceTimersByTime(500);

    return [
        current.bind(key).value,
        current.entity[key],
    ];
};
