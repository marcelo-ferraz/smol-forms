import { destructureCfg, runOrReduce } from './helpers';
import { generateChars, GenFlags, TestEntity } from './test/helpers';

describe('helpers', () => {
    describe('runOrReduce', () => {
        it('should run one function', () => {
            const expectedResult = generateChars(4);
            const [result] = runOrReduce((val) => val, expectedResult);
            expect(result).toBe(expectedResult);
        });
        it('should run multiple functions', () => {
            const input = Math.random();
            const expectedResults = [
                input + 1,
                input + 2,
            ];
            const results = runOrReduce([
                (val) => val + 1,
                (val) => val + 2,
            ], input);

            expect(results[0]).toBe(expectedResults[0]);
            expect(results[1]).toBe(expectedResults[1]);
        });
        it('should run multiple functions and filter falsy results', () => {
            const input = Math.random();
            const expectedResults = [
                input + 1,
                input + 2,
            ];
            const results = runOrReduce([
                (val) => val + 1,
                () => null,
                () => false,
                (val) => val + 2,
            ], input);

            expect(results[0]).toBe(expectedResults[0]);
            expect(results[1]).toBe(expectedResults[1]);
        });
    });

    describe('destructureCfg', () => {
        test('if passed a string, then theres no config and only a selector', () => {
            const expectedSelector = 'id';
            const [selector, cfg] = destructureCfg<TestEntity>(expectedSelector);
            expect(selector).toBe(expectedSelector);
            expect(cfg).toBe(null);
        });

        it('should throw an exception if theres more than one property', () => {
            const invalidSelector1 = generateChars(3, GenFlags.all);
            const invalidSelector2 = generateChars(3, GenFlags.all);
            const notRelevantConfig: unknown = null;
            const input = {
                [invalidSelector1]: notRelevantConfig,
                [invalidSelector2]: notRelevantConfig,
            };

            expect(
                () => destructureCfg<TestEntity>(input),
            ).toThrow(/Invalid binding input: .+$/);
        });

        // { [key]: () => {}}
        test('if passed key and a function, then set the selector and parser', () => {
            const expectedSelector = 'id';
            const expectedParser = jest.fn();
            const [selector, cfg] = destructureCfg<TestEntity>(
                { [expectedSelector]: expectedParser },
            );

            expect(selector).toBe(expectedSelector);
            expect(cfg.parser).toBe(expectedParser);
        });

        // { [key]: [() => {}, () => {}]}
        test('if passed key and a function array, then set the selector and validators', () => {
            const expectedSelector = 'id';
            const expectedValidators = [jest.fn(), jest.fn()];
            const [selector, cfg] = destructureCfg<TestEntity>(
                { [expectedSelector]: expectedValidators },
            );

            expect(selector).toBe(expectedSelector);
            expect(cfg.validators).toBe(expectedValidators);
        });

        // { [key]: { /* config */} }
        test('if passed key and an object, it will be selector and config', () => {
            const expectedSelector = 'id';
            const expectedParser = jest.fn();
            const expectedValidators = [jest.fn(), jest.fn()];
            const expectedType = jest.fn();
            const [selector, cfg] = destructureCfg<TestEntity>(
                {
                    [expectedSelector]: {
                        parser: expectedParser,
                        validators: expectedValidators,
                        type: expectedType,
                    },
                },
            );

            expect(selector).toBe(expectedSelector);
            expect(cfg.parser).toBe(expectedParser);
            expect(cfg.type).toBe(expectedType);
            expect(cfg.validators).toBe(expectedValidators);
        });
    });
});
