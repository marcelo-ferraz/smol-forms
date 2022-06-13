import {
    generateChars, generateFloat, generateInt, GenFlags,
} from './test/helpers';
import { int, float } from './inputTypes';

describe('inputTypes', () => {
    describe('int', () => {
        it('not accept letters', () => {
            const input = generateChars(4, GenFlags.lowerCaseLetters);
            const result = int(input);

            expect(result).toBe(null);
        });
        it('accept numbers', () => {
            const input = generateChars(4, GenFlags.numbers);
            const inputAsNum = Number.parseInt(input, 10);
            const result = int(input);

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('accept hex numbers', () => {
            const input = generateChars(4, GenFlags.numbers);
            const radix = 16;
            const inputAsNum = Number.parseInt(input, radix);
            const result = int(input, { radix });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('accept octal numbers', () => {
            const input = generateChars(4, GenFlags.numbers);
            const radix = 8;
            const inputAsNum = Number.parseInt(input, radix);
            const result = int(input, { radix });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('accept bin numbers', () => {
            const input = generateChars(4, GenFlags.numbers);
            const radix = 2;
            const inputAsNum = Number.parseInt(input, radix);
            const result = int(input, { radix });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('must be more than the minimum', () => {
            const inputAsNum = generateInt(4);
            const input = inputAsNum.toString();
            const min = inputAsNum - 1;
            const result = int(input, { min });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('must be less than the maximum', () => {
            const inputAsNum = generateInt(4);
            const input = inputAsNum.toString();
            const max = inputAsNum + 1;
            const result = int(input, { max });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('must not be more than the minimum', () => {
            const inputAsNum = generateInt(4);
            const input = inputAsNum.toString();
            const min = inputAsNum + 1;
            const result = int(input, { min });

            expect(result).toStrictEqual(null);
        });
        it('must not be less than the maximum', () => {
            const inputAsNum = generateInt(4);
            const input = inputAsNum.toString();
            const max = inputAsNum - 1;
            const result = int(input, { max });

            expect(result).toStrictEqual(null);
        });
    });

    describe('float', () => {
        it('not accept letters', () => {
            const input = generateChars(4, GenFlags.lowerCaseLetters);
            const result = float(input);

            expect(result).toBe(null);
        });
        it('accept numbers', () => {
            const inputAsNum = generateFloat();
            const input = inputAsNum.toString();
            const result = float(input);

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('must be more than the minimum', () => {
            const inputAsNum = generateFloat();
            const input = inputAsNum.toString();
            const min = inputAsNum - 2;
            const result = float(input, { min });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('must be less than the maximum', () => {
            const inputAsNum = generateFloat();
            const input = inputAsNum.toString();
            const max = inputAsNum + 2;
            const result = float(input, { max });

            expect(result).toStrictEqual([input, inputAsNum]);
        });
        it('must not be more than the minimum', () => {
            const inputAsNum = generateFloat();
            const input = inputAsNum.toString();
            const min = inputAsNum + 1;
            const result = float(input, { min });

            expect(result).toStrictEqual(null);
        });
        it('must not be less than the maximum', () => {
            const inputAsNum = generateFloat();
            const input = inputAsNum.toString();
            const max = inputAsNum - 1;
            const result = float(input, { max });

            expect(result).toStrictEqual(null);
        });
    });
});
