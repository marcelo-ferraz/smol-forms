import {
    useCallback,
    useState,
    useMemo,
    useEffect,
    useRef,
} from 'react';

import binderFactory from './binderFactory';

import { runOrReduce } from './helpers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    MuiBindProps,
    MinimumToBind,
    SmolInputChangeHandler,
    MoreGenericConfigForBind,
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
}: Partial<FormHookProps<Entity, FieldBoundProps>> = {})
: FormHookResult<Entity, FieldBoundProps> {
    const [entityState, setEntityState] = useState<DisplayNValue<Entity>>({
        value: oldSchoolDeepCopy(initial),
        display: oldSchoolDeepCopy(initial),
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors<Entity>>({});
    const lastEventRef = useRef<ChangeArgs<Entity>>(null);

    useEffect(() => {
        // only raise when the handler is passed and there are errors
        if (onValidationError && Object.keys(validationErrors)) {
            onValidationError(validationErrors);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validationErrors]);

    const internalValidate = useCallback(
        (
            cfg: MoreGenericConfigForBind<Entity>,
            value: unknown,
            ent: Partial<Entity>,
            selector: keyof Entity,
        ) => {
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
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    [selector]: [
                        ...prevErrors[selector] ?? [],
                        ...errors,
                    ],
                }));
            } else {
            // else, clear them
                setValidationErrors((prevErrors) => {
                    const nextErrors = { ...prevErrors };
                    if (selector in nextErrors) {
                        delete nextErrors[selector];
                    }
                    return nextErrors;
                });
            }
        },
        [],
    );

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

                    // try to apply any validations that were passed
                    internalValidate(
                        cfg,
                        nextState.display[selector],
                        nextState.value,
                        selector,
                    );

                    lastEventRef.current = {
                        cfg,
                        event,
                        selector,
                        prevEntity: prevState.value,
                        prevEntityDisplay: prevState.display,
                    };

                    return nextState;
                });
            };

        return handler;
    }, [internalValidate]);

    const entity = useMemo(() => {
        if (!lastEventRef.current || !changeCallback) {
            return entityState;
        }

        const {
            cfg,
            event,
            selector,
            prevEntity,
            prevEntityDisplay,
        } = lastEventRef.current;

        // if the theres a change callback, we call it
        let callbackResult = changeCallback({
            cfg,
            event,
            selector,
            entity: entityState.value,
            prevEntity,
            entityDisplay: entityState.display,
            prevEntityDisplay,
        });

        if (!callbackResult) { return entityState; }

        // if the return is something
        callbackResult = callbackResult as DisplayNValue<Entity>;
        // that result can override the next state
        return {
            display: {
                ...entityState.display,
                ...(callbackResult.display ?? {}),
            },
            value: {
                ...entityState.value,
                ...(callbackResult.value ?? {}),
            },
        };
    }, [changeCallback, entityState]);

    const exposedValidate = useCallback(() => {
        if (lastEventRef.current) { return; }

        const {
            cfg,
            event,
            selector,
        } = lastEventRef.current;

        internalValidate(
            cfg, event.target.value, entity.value, selector,
        );
    }, [entity?.value, internalValidate]);

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
        validate: exposedValidate,
        emitFieldChange: fieldChangeHandler,
        entity: entity.value,
        errors: validationErrors,
        setErrors: setValidationErrors,
    };
}

export default useSmolForms;
