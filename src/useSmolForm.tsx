import {
    useCallback,
    useState,
    useMemo,
    useEffect,
    useRef,
} from 'react';

import binderFactory from './binderFactory';

import { getFieldsToValidate, runOrReduce, useDebounce as useDebouncedValue } from './helpers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    MinPropsToBind,
    SmolInputChangeHandler,
    Bind,
    DisplayNValue,
    SmolChangeCallbackArgs,
    OnBindingCallback,
    FieldsMetadata,
} from './types';

// I could just have the spread, but it wouldnt copy nested objs
const oldSchoolDeepCopy = (obj: unknown) => JSON.parse(JSON.stringify(obj));

type ChangeArgs<Entity> = Omit<
    SmolChangeCallbackArgs<Entity>,
    'entityDisplay' | 'entity'
>;

export const DEFAULT_INPUT_DELAY = 100;

function useSmolForms<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
>({
    initial = {},
    onValidationError,
    adapter,
    onChange: changeCallback,
    delay = DEFAULT_INPUT_DELAY,
}: Partial<FormHookProps<Entity, FieldBoundProps>> = {})
: FormHookResult<Entity, FieldBoundProps> {
    const fieldsMetadata = useRef<FieldsMetadata<Entity>>({});

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

                if (cfg?.eventMap) {
                    value = cfg?.eventMap(event);
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

    const internalValidate = useCallback(
        (
            selectorsNvalues: [keyof Entity, unknown][],
            ent: DisplayNValue<Entity>,
            justTest = false,
        ) => {
            let isValid: boolean = null;

            const newErrors = selectorsNvalues.reduce(
                (errs, [selector, value]) => {
                    const cfg = fieldsMetadata.current[selector];
                    // // const cfg = fieldsMetadata[selector];
                    const val = value ?? ent.display[selector];

                    const itemErrors: string[] = runOrReduce<string>(
                        cfg?.validators, {
                            // the visual value
                            value: val,
                            // the entity with the possible "proper value"
                            entity: ent,
                            // selector for that property
                            selector,
                        },
                    );

                    if (itemErrors?.length) {
                        isValid = false;
                    }

                    return {
                        ...errs,
                        [selector]: itemErrors?.length ? itemErrors : undefined,
                    };
                }, {},
            );

            if (!justTest) {
                setValidationErrors(
                    (prevErrors) => ({
                        ...prevErrors,
                        ...newErrors,
                    }),
                );
            }
            return isValid;
        },
        [fieldsMetadata],
    );

    const entity = useMemo(() => {
        if (lastEventRef.current) {
            fieldsMetadata.current[
                lastEventRef.current.selector
            ].touched = true;
        }

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

    const validate = useCallback<FormHookResult<Entity, FieldBoundProps>['validate']>(
        (selector: keyof Entity | 'all' | 'touched', justTest = false) => {
            if (selector === 'all' || selector === 'touched') {
                const fieldsToValidate = getFieldsToValidate(
                    fieldsMetadata.current,
                    // fieldsMetadata,
                    entity.value,
                    selector === 'all',
                );

                return internalValidate(fieldsToValidate, entity, justTest);
            }

            return internalValidate(
                [[selector, entity.value[selector]]],
                entity,
                justTest,
            );
        },
        [entity, fieldsMetadata, internalValidate],
    );

    const bind = useMemo<Bind<Entity, FieldBoundProps>>(
        () => {
            const keepTheMetadata: OnBindingCallback<Entity> = (selector, cfg) => {
                fieldsMetadata.current[selector] = cfg ?? {};
            };

            const blurHandle = () => {
                if (!lastEventRef.current) { return; }

                const { selector } = lastEventRef.current;

                // given the delay with the debouncing,
                // and if the user is fast enough,
                // validate was checking a model before the final result.
                // this will queue the check asynchronously the model after the debouncing is done
                setTimeout(() => validate(selector), delay * 1.02);
            };

            return binderFactory(
                entityState,
                validationErrors,
                adapter,
                fieldChangeHandler,
                blurHandle,
                keepTheMetadata,
            );
        }, [adapter, delay, entityState, fieldChangeHandler, validate, validationErrors],
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
