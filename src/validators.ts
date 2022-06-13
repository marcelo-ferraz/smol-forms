import { ValidateFuncArgs } from './types';

export const regexes = {
    // RFC 5322
    // eslint-disable-next-line no-control-regex
    isEmail: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    isInt: /^\d*$/,
    isFloat: (decimal: number) => new RegExp(`^\\d*\\.?\\d{0,${decimal}}$`),
};

export const DEFAULT_REQUIRED_MSG = 'This field is required';
export const DEFAULT_INT_MSG = 'This field should be a number';
export const DEFAULT_FLOAT_MSG = 'This field should be a decimal';
export const DEFAULT_GENERIC_MSG = 'This field is incorrect';
export const DEFAULT_EMAIL_MSG = 'This field is an email';

export const isRequired = (
    { value }: ValidateFuncArgs,
    msg = DEFAULT_REQUIRED_MSG,
) => (!value?.toString().trim() ? msg : null);

export const isInt = (
    { value }: ValidateFuncArgs,
    msg = DEFAULT_INT_MSG,
) => (
    !regexes.isInt.test(
        value?.toString().trim() ?? '',
    ) ? msg : null
);

export const isFloat = (decimal = 2) => (
    { value }: ValidateFuncArgs,
    msg = DEFAULT_FLOAT_MSG,
) => (
    !regexes.isFloat(decimal).test(
        value?.toString().trim() ?? '',
    ) ? msg : null
);

export const pattern = (
    regex: RegExp,
) => (
    { value }: ValidateFuncArgs,
    msg = DEFAULT_GENERIC_MSG,
) => (
    !new RegExp(regex).test(
        value?.toString().trim() ?? '',
    ) ? msg : null
);

export const isEmail = (
    { value }: ValidateFuncArgs,
    msg = DEFAULT_EMAIL_MSG,
) => (
    !regexes.isEmail.test(
        value?.toString().trim() ?? '',
    ) ? msg : null
);
