import {
    useCallback,
    useState,
    useMemo,
    useEffect,
} from 'react';

import binderFactory from './binderFactory';

import { runOrReduce } from './helpers';
import {
    FormHookProps,
    FormHookResult,
    ValidationErrors,
    DefaultBindProps,
    MinimumToBind,
    SmolInputChangeHandler,
    MoreGenericConfigForBind,
    Bind,
    DisplayNValue,
} from './types';

// I could just have the spread, but it wouldnt copy nested objs
const oldSchoolDeepCopy = (obj: unknown) => JSON.parse(JSON.stringify(obj));

function useSmolForms<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
>({
    initial = {},
    onValidationError,
    adapter,
    onChange: changeCallback,
}: Partial<FormHookProps<Entity, FieldBoundProps>> = {})
: FormHookResult<Entity, FieldBoundProps> {
    const [entity, setEntity] = useState<DisplayNValue<Entity>>({
        value: oldSchoolDeepCopy(initial),
        display: oldSchoolDeepCopy(initial),
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors<Entity>>({});

    useEffect(() => {
        // only raise when the handler is passed and there are errors
        if (onValidationError && Object.keys(validationErrors)) {
            onValidationError(validationErrors);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validationErrors]);

    const validate = useCallback(
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

                setEntity((prevState) => {
                    // copy previous state for changing
                    let nextState = oldSchoolDeepCopy(prevState);

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
                    validate(
                        cfg,
                        nextState.display[selector],
                        nextState.value,
                        selector,
                    );

                    if (changeCallback) {
                        // if the theres a change callback, we call it
                        let callbackResult = changeCallback({
                            cfg,
                            event,
                            selector,
                            entity: nextState.value,
                            prevEntity: prevState.value,
                            entityDisplay: nextState.display,
                            prevEntityDisplay: prevState.display,
                        });

                        // if the return is something
                        if (!callbackResult) {
                            callbackResult = callbackResult as DisplayNValue<Entity>;
                            // that result can override the next state
                            nextState = {
                                display: {
                                    ...nextState.display,
                                    ...(callbackResult.display ?? {}),
                                },
                                value: {
                                    ...nextState.value,
                                    ...(callbackResult.value ?? {}),
                                },
                            };
                        }
                    }

                    return nextState;
                });
            };

        return handler;
    }, [changeCallback, validate]);

    const bind = useMemo<Bind<Entity, FieldBoundProps>>(
        () => binderFactory(
            entity,
            validationErrors,
            adapter,
            fieldChangeHandler,
        ), [
            adapter,
            entity,
            fieldChangeHandler,
            validationErrors,
        ],
    );

    return {
        bind,
        emitFieldChange: fieldChangeHandler,
        entity: entity.value,
        errors: validationErrors,
        setErrors: setValidationErrors,
    };
}

export default useSmolForms;
