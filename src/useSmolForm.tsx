import {
    useCallback, useState, useMemo, useEffect,
} from 'react';
import defaultBinding from './defaultBinder';

import { destructureCfg, runOrReduce } from './helpers';
import { toInt, toFloat } from './parsers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    DefaultBindMappedResult,
    MinimumToBindMapper,
    SmolChangeHandler,
    MoreGenericConfigForBind,
    BindingInput,
    Bind,
} from './types';

function useSmolForms<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
>({
    initial,
    onValidationError,
    bindingMapper,
    onChange: changeCallback,
}: FormHookProps<Entity, R>): FormHookResult<Entity, R> {
    const [entity, setEntity] = useState<Partial<Entity>>(initial ?? {});
    const [validationErrors, setValidationErrors] = useState<ValidationErrors<Entity>>({});

    useEffect(() => {
        // only raise when the handler is passed and there are errors
        if (onValidationError && Object.keys(validationErrors)) {
            onValidationError(validationErrors);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validationErrors]);

    const fieldChangeHandler = useCallback<SmolChangeHandler<Entity>>(
        (event, selector, cfg) => {
            const { target } = event;

            if (!target) { return; }

            let value: unknown = target.type === 'checkbox'
                ? target.checked
                : target.value;

            if (cfg?.parse) {
                value = cfg.parse(value, selector, entity);

                if (!value) { return; }
            }

            const validation = cfg?.validators;

            const errors = runOrReduce<string>(validation, { value, entity });

            if (errors.length) {
                setValidationErrors((prevState) => ({
                    ...prevState,
                    [selector]: [
                        ...prevState[selector] ?? [],
                        ...errors,
                    ],
                }));
            }

            if (changeCallback) {
                if (changeCallback) {
                    changeCallback(event, selector, cfg);
                }
            }

            setEntity((prevState) => {
                const nextState = { ...prevState };

                nextState[selector] = value as Entity[keyof Entity];
                return nextState;
            });
        }, [changeCallback, entity],
    );

    const bind = useMemo<Bind<Entity, R>>(
        () => {
            const coreFunc = (
                selector: keyof Entity,
                cfg: MoreGenericConfigForBind<Entity>,
                changeHandler: SmolChangeHandler<Entity>,
            ) => {
                if (bindingMapper) {
                    return bindingMapper(
                        selector, changeHandler, cfg, validationErrors, entity,
                    );
                }

                return defaultBinding<Entity>(
                    selector, changeHandler, cfg, validationErrors, entity,
                ) as unknown as R;
            };

            const mainFunc = (input: BindingInput<Entity>): R => {
                const [selector, cfg] = destructureCfg<Entity>(input);

                return coreFunc(selector, cfg, fieldChangeHandler);
            };

            mainFunc.int = (input: BindingInput<Entity>, radix = 10) => {
                const [selector, config] = destructureCfg<Entity>(input);

                const parse = (value: unknown) => toInt(value, radix);

                return coreFunc(
                    selector,
                    config ? { ...config, parse } : { parse },
                    fieldChangeHandler,
                );
            };

            mainFunc.float = (input: BindingInput<Entity>) => {
                const [selector, config] = destructureCfg<Entity>(input);

                const parse = toFloat;

                return coreFunc(
                    selector,
                    config ? { ...config, parse } : { parse },
                    fieldChangeHandler,
                );
            };

            mainFunc.str = (input: BindingInput<Entity>) => {
                const [selector, config] = destructureCfg<Entity>(input);

                const defaultValue = '';

                return coreFunc(
                    selector,
                    config ? { ...config, defaultValue } : { defaultValue },
                    fieldChangeHandler,
                );
            };

            return mainFunc;

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [entity, fieldChangeHandler, validationErrors],
    );

    return {
        bind,
        emitFieldChange: fieldChangeHandler,
        entity,
        setEntity,
        errors: validationErrors,
        setErrors: setValidationErrors,
    };
}

export default useSmolForms;
