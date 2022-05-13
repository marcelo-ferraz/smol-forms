import { NumberArgs, IntArgs } from './types';

const numberBase = (
    value: string, numberVal: number, { min, max }: NumberArgs = {},
): [unknown, unknown] => {
    if (Number.isNaN(numberVal)) { return null; }

    if (min && numberVal <= min) {
        return null;
    }

    if (max && numberVal >= max) {
        return null;
    }

    return [value, numberVal];
};

const floatRegex = /^\d+\.?\d*$/;
const intRegex = /^\d+$/;

export const int = (value: unknown, { radix, ...args }: IntArgs = {}) => {

    const val = value.toString();

    if (!value || !intRegex.test(val)) {
        return null;
    }

    const numberVal = Number
        .parseInt(val, radix || 10);

    return numberBase(val, numberVal, args);
};

export const float = (value: unknown, args?: NumberArgs) => {
    const val = value.toString();

    if (!value || !floatRegex.test(val)) {
        return null;
    }

    const numberVal = Number
        .parseFloat(val);

    return numberBase(val, numberVal, args);
};
