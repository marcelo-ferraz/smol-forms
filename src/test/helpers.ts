/* eslint-disable no-bitwise */

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

export type TestEntity = Partial<{
    id: string;
    strValue: string,
    intValue: number,
    floatValue: number,
    emptyValue: unknown,
}>;
