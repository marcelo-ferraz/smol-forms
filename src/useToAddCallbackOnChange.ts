import { useCallback } from 'react';
import { addCallbackOnChange } from './helpers';
import {
    MinimumToBindMapper,
    SmolChangeHandler,
    BindFunc,
} from './types';

export default function useToAddCallbackOnChange<
    Entity,
    R extends MinimumToBindMapper<Entity>,
>(
    registerFromHook: BindFunc<Entity, R>,
    changeCallback: SmolChangeHandler<Entity>,
) {
    const register = useCallback<BindFunc<Entity, R>>(
        (options) => {
        // 1 - separate the change from the registration
            const {
                onChange: inputChange,
                ...otherProps
            } = registerFromHook(options);

            // 2 - add an interceptor to that
            const changeHandler = addCallbackOnChange<Entity>(
                options, inputChange, changeCallback,
            );

            // 3 - profit
            return ({
                ...otherProps,
                onChange: changeHandler,
            }) as unknown as R;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [registerFromHook],
    );

    return register;
}
