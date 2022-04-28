import {
    useCallback, useState, useMemo, useEffect,
} from 'react';
import defaultRegistration from './defaultRegistration';

import { destructureCfg, runOrReduce } from './helpers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    DefaultBindMappedResult,
    MinimumToBindMapper,
    SmolChangeHandler,
    BindFunc,
} from './types';

function useSmolForms<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
>({
    initial, onValidationError, registrationMapper,
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

    const fieldChangeHandler = useMemo<SmolChangeHandler<Entity>>(() => (event, selector, cfg) => {
        const { target } = event;

        if (target) { return; }

        const value: unknown = target.type === 'checkbox'
            ? target.checked
            : target.value;

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

        setEntity((prevState) => {
            const nextState = { ...prevState };

            nextState[selector] = value as Entity[keyof Entity];
            return nextState;
        });
    }, [entity]);

    const bind = useCallback<BindFunc<Entity, R>>(
        (options): R => {
            const [selector, cfg] = destructureCfg<Entity>(options);

            if (registrationMapper) {
                return registrationMapper(
                    selector, fieldChangeHandler, cfg, validationErrors, entity,
                );
            }

            return defaultRegistration<Entity>(
                selector, fieldChangeHandler, cfg, validationErrors, entity,
            ) as unknown as R;
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
