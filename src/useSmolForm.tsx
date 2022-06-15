import {
    useCallback,
    useState,
    useMemo,
    useEffect,
    useRef,
} from 'react';

import binderFactory from './binderFactory';

import { runOrReduce, useDebounce } from './helpers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    MuiBindProps,
    MinimumToBind,
    SmolInputChangeHandler,
    Bind,
    DisplayNValue,
    SmolChangeCallbackArgs,
} from './types';

// I could just have the spread, but it wouldnt copy nested objs
const oldSchoolDeepCopy = (obj: unknown) => JSON.parse(JSON.stringify(obj));

type ChangeArgs<Entity> = Omit<
    SmolChangeCallbackArgs<Entity>,
    'entityDisplay' | 'entity'
>;

function useSmolForms<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = MuiBindProps<Entity>
>({
    initial = {},
    onValidationError,
    adapter,
    onChange: changeCallback,
    delay = 300,
}: Partial<FormHookProps<Entity, FieldBoundProps>> = {})
: FormHookResult<Entity, FieldBoundProps> {
    const [entityState, setEntityState] = useState<DisplayNValue<Entity>>({
        value: oldSchoolDeepCopy(initial),
        display: oldSchoolDeepCopy(initial),
    });
    const debouncedEntity = useDebounce(entityState, delay);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors<Entity>>({});
    const lastEventRef = useRef<ChangeArgs<Entity>>(null);

    useEffect(() => {
        // only raise when the handler is passed and there are errors
        if (onValidationError && Object.keys(validationErrors)) {
            onValidationError(validationErrors);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validationErrors]);

    const fieldChangeHandler = useMemo(() => {
        const handler
            : SmolInputChangeHandler<Entity> = (
                event,
                selector,
                cfg,
            ) => {
                let value: unknown;

                if (cfg?.parser) {
                    value = cfg?.parser(event);
                } else {
                    const { target } = event;

                    if (!target) { return; }

                    value = target.type === 'checkbox'
                        ? target.checked
                        : target.value;
                }

                setEntityState((prevState) => {
                    // copy previous state for changing
                    const nextState = oldSchoolDeepCopy(prevState);

                    // apply the value to the state,
                    // and unless the component treats it, turns it to string,
                    nextState.value[selector] = value as Entity[keyof Entity];
                    nextState.display[selector] = value;

                    let valueTuple = null;

                    // if theres a value and
                    // the configuration has a "type" for the input
                    if (value && cfg?.type) {
                        // it tries to parse against that "type"
                        // it returns a tuple, the display and the proper value
                        valueTuple = cfg.type(
                            nextState.value[selector],
                            selector,
                            nextState.value,
                        ) as [unknown, Entity[keyof Entity]];

                        // this means that the test against the "type" failed,
                        // so nothing is propagated and the change is aborted
                        if (!valueTuple) { return prevState; }

                        // this means that the test passed,
                        ( // for better or for worst
                            [
                                // the display is assigned,
                                // usually being the value typed
                                nextState.display[selector],
                                // the "proper value"
                                // (whatever that means)
                                // is applied
                                nextState.value[selector],
                            ] = valueTuple
                        );
                    }

                    lastEventRef.current = {
                        cfg,
                        event,
                        value,
                        selector,
                        prevEntity: prevState.value,
                        prevEntityDisplay: prevState.display,
                    };

                    return nextState;
                });
            };

        return handler;
    }, []);

    const entity = useMemo(() => {
        if (!lastEventRef.current || !changeCallback) {
            return debouncedEntity;
        }

        const {
            cfg,
            event,
            value,
            selector,
            prevEntity,
            prevEntityDisplay,
        } = lastEventRef.current;

        // if the theres a change callback, we call it
        let callbackResult = changeCallback({
            cfg,
            event,
            value,
            selector,
            entity: debouncedEntity.value,
            prevEntity,
            entityDisplay: debouncedEntity.display,
            prevEntityDisplay,
        });

        if (!callbackResult) { return debouncedEntity; }

        // if the return is something
        callbackResult = callbackResult as DisplayNValue<Entity>;
        // that result can override the next state
        return {
            display: {
                ...debouncedEntity.display,
                ...(callbackResult.display ?? {}),
            },
            value: {
                ...debouncedEntity.value,
                ...(callbackResult.value ?? {}),
            },
        };
    }, [changeCallback, debouncedEntity]);

    const validate = useCallback(
        () => {
            if (!lastEventRef.current) { return; }

            const {
                cfg,
                value,
                selector,
            } = lastEventRef.current;

            const errors = runOrReduce<string>(
                cfg?.validators, {
                    // the visual value
                    value,
                    // the entity with the possible "proper value"
                    entity,
                    // selector for that property
                    selector,
                },
            );

            // if there are errors, set them
            if (errors.length) {
                setValidationErrors(
                    (prevErrors) => ({
                        ...prevErrors,
                        [selector]: [
                            ...errors,
                        ],
                    }),
                );
            } else {
                // else, clear them
                setValidationErrors(
                    (prevErrors) => {
                        const nextErrors = { ...prevErrors };
                        if (selector in nextErrors) {
                            delete nextErrors[selector];
                        }
                        return nextErrors;
                    },
                );
            }
        },
        [entity],
    );

    useEffect(() => {
        // try to apply any validations that were passed
        validate();
    }, [validate]);

    const bind = useMemo<Bind<Entity, FieldBoundProps>>(
        () => binderFactory(
            entityState,
            validationErrors,
            adapter,
            fieldChangeHandler,
        ), [
            adapter,
            entityState,
            fieldChangeHandler,
            validationErrors,
        ],
    );

    return {
        bind,
        validate,
        emitFieldChange: fieldChangeHandler,
        entity: entity.value,
        errors: validationErrors,
        setErrors: setValidationErrors,
    };
}

export default useSmolForms;
