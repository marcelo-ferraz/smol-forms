export const toInt = (value: unknown, radix = 10) => {
    const numberVal = Number
        .parseInt(value as string, radix);

    return !Number.isNaN(numberVal)
        ? numberVal
        : null;
};

export const toFloat = (value: unknown) => {
    const numberVal = Number
        .parseFloat(value as string);

    return !Number.isNaN(numberVal)
        ? numberVal
        : null;
};
