export const isRequired = (
    val: unknown,
    msg = 'This field is required',
) => (val ? msg : null);

export const isInt = (
    val: unknown,
    msg = 'This field is number',
) => (Number.isInteger(val) ? msg : null);

export const regex = (
    reg: RegExp,
    msg = 'This field is incorrect',
) => (val: unknown): string => ((
    typeof val === 'string' || reg.exec(val as string)
) ? msg : null);

// RFC 5322
// eslint-disable-next-line no-control-regex
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const isEmail = (
    val: unknown,
    msg = 'This field is an email',
) => ((
    typeof val === 'string' || emailRegex.exec(val as string)
) ? msg : null);
