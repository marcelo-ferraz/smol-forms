import {
    useCallback,
    useState,
    useMemo,
    useEffect,
    useRef,
} from 'react';

import binderFactory from './binderFactory';

import { runOrReduce, useDebounce as useDebouncedValue } from './helpers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    MuiBindProps,
    MinPropsToBind,
    SmolInputChangeHandler,
    Bind,
    DisplayNValue,
    SmolChangeCallbackArgs,
    MoreGenericConfigForBind,
    OnBindingCallback,
} from './types';

// I could just have the spread, but it wouldnt copy nested objs
const oldSchoolDeepCopy = (obj: unknown) => JSON.parse(JSON.stringify(obj));

type ChangeArgs<Entity> = Omit<
    SmolChangeCallbackArgs<Entity>,
    'entityDisplay' | 'entity'
>;

type BoundFields<Entity> = { [key in keyof Entity]?: MoreGenericConfigForBind<Entity> }

function useSmolForms<
    Entity,
    FieldBoundProps extends MinPropsToBind<Entity> = MuiBindProps<Entity>
>({
    initial = {},
    onValidationError,
    adapter,
    onChange: changeCallback,
    delay = 300,
}: Partial<FormHookProps<Entity, FieldBoundProps>> = {})
: FormHookResult<Entity, FieldBoundProps> {
    const boundFields = useRef<BoundFields<Entity>>({});

    const [entityState, setEntityState] = useState<DisplayNValue<Entity>>({
        value: oldSchoolDeepCopy(initial),
        display: oldSchoolDeepCopy(initial),
    });
    const debouncedEntity = useDebouncedValue(entityState, delay);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors<Entity>>({});
    /* TODO: there might be a racing condition.
        I try to mitigate it by debouncing the changes,
        so the last value is the one to have the reference saved,
        but I need to keep an eye on it.
    */
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

    const internalValidate2 = useCallback(
        (
            selectorsNvalues: [keyof Entity, unknown][],
            ent: DisplayNValue<Entity>,
        ) => {
            if (!lastEventRef.current) { return null; }

            const newErrors = selectorsNvalues.reduce(
                (errs, [selector, value]) => {
                    const cfg = boundFields.current[selector];
                    const val = value ?? ent.display[selector];

                    const itemErrors = runOrReduce<string>(
                        cfg?.validators, {
                            // the visual value
                            value: val,
                            // the entity with the possible "proper value"
                            entity: ent,
                            // selector for that property
                            selector,
                        },
                    );

                    return {
                        ...errs,
                        [selector]: itemErrors.length ? itemErrors : undefined,
                    };
                }, {},
            );

            setValidationErrors(
                (prevErrors) => ({
                    ...prevErrors,
                    ...newErrors,
                }),
            );

            return !Object
                .values(newErrors)
                .some((err: string[]) => !!err?.length);
        },
        [],
    );

    const internalValidate = useCallback(
        (selector: keyof Entity, value: unknown, ent: DisplayNValue<Entity>) => {
            if (!lastEventRef.current) { return null; }

            const cfg = boundFields.current[selector];

            const errors = runOrReduce<string>(
                cfg?.validators, {
                    // the visual value
                    value,
                    // the entity with the possible "proper value"
                    entity: ent,
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

            return !errors.length;
        },
        [],
    );

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

        internalValidate(selector, value, callbackResult || debouncedEntity);

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
    }, [changeCallback, debouncedEntity, internalValidate]);

    const bind = useMemo<Bind<Entity, FieldBoundProps>>(
        () => {
            const keepTheConfig: OnBindingCallback<Entity> = (selector, cfg) => {
                boundFields.current[selector] = cfg;
            };

            return binderFactory(
                entityState,
                validationErrors,
                adapter,
                fieldChangeHandler,
                keepTheConfig,
            );
        }, [
            adapter,
            entityState,
            fieldChangeHandler,
            validationErrors,
        ],
    );

    const validate = useCallback(
        (selector: keyof Entity) => internalValidate(
            selector,
            entity.display[selector],
            entity,
        ),
        [entity, internalValidate],
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
