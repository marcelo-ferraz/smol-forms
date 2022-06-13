import React from 'react';
import { render } from '@testing-library/react';
import { randomInt } from 'crypto';
import SmolForm from './SmolForm';
import { fireChange, TestEntity } from './test/helpers';

jest.useFakeTimers();

describe('<SmollForm />', () => {
    describe('onChange', () => {
        it('should trigger when theres a change on the entity', () => {
            const handlerStub = jest.fn();
            const expectedSelector = 'strValue';
            const expectedInput = randomInt(255).toString();
            const expectedEntity = {
                [expectedSelector]: expectedInput,
            };
            const expectedDisplay = {
                [expectedSelector]: expectedInput,
            };

            const form = render(
                <SmolForm<TestEntity>
                    onChange={handlerStub}
                    formFields={({ bind }) => [
                        <input
                            type="text"
                            data-testid={expectedSelector}
                            {...bind(expectedSelector)}
                        />,
                    ]}
                />,
            );

            fireChange(
                form.getByTestId(expectedSelector), {
                    target: { value: expectedInput },
                },
            );

            expect(handlerStub).toBeCalledWith({
                event: expect.anything(),
                cfg: null,
                entityDisplay: expectedDisplay,
                prevEntityDisplay: expect.anything(),
                entity: expectedEntity,
                prevEntity: {},
                selector: expectedSelector,
            });
        });
    });
});
