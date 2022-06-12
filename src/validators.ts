export const regexes = {
    // RFC 5322
    // eslint-disable-next-line no-control-regex
    isEmail: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    isInt: /^\d*$/,
    isFloat: (decimal: number) => new RegExp(`^\\d*\\.?\\d{0,${decimal}}$`),
};

export const isRequired = (
    val: unknown,
    msg = 'This field is required',
) => (!val?.toString().trim() ? msg : null);

export const isInt = (
    val: unknown,
    msg = 'This field is number',
) => (regexes.isInt.test(val?.toString().trim() ?? '') ? msg : null);

export const isFloat = (decimal = 2) => (
    { toString }: unknown = '',
    msg = 'This field is number',
) => (regexes.isFloat(decimal).test(
    toString().trim() ?? '',
) ? msg : null);

export const pattern = (
    regex: RegExp,
) => (
    { toString }: unknown = '',
    msg = 'This field is incorrect',
) => (new RegExp(regex).test(
    toString().trim() ?? '',
) ? msg : null);

export const isEmail = (
    val: unknown,
    msg = 'This field is an email',
) => (new RegExp(regexes.isEmail).test(
    val?.toString().trim() ?? '',
) ? msg : null);
