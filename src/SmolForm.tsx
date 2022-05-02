import React, {
    ReactElement, forwardRef, useImperativeHandle, ForwardedRef,
} from 'react';
import SmolFormFactory from './SmolFormFactory';
import {
    SmolFormRef, SmolFormProps, MinimumToBindMapper, DefaultBindMappedResult,
} from './types';
import useSmolForms from './useSmolForms';

function SmolFormInner<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
>({
    initial = {},
    form,
    formFields,
    onChange,
    registrationMapper,
    onValidationError,
    top,
    bottom,
    elements,
}: SmolFormProps<Entity, R>,
ref: ForwardedRef<SmolFormRef<Entity, R>>): ReactElement {
    const {
        entity,
        setEntity,
        errors,
        bind,
        setErrors,
        emitFieldChange,
    } = useSmolForms<Entity, R>({
        initial,
        onChange,
        onValidationError,
        registrationMapper,
    });

    useImperativeHandle(ref, () => ({
        bind,
        entity,
        setEntity,
        errors,
        setErrors,
        emitFieldChange,
    }), [
        bind,
        entity,
        setEntity,
        errors,
        setErrors,
        emitFieldChange,
    ]);

    return (
        <SmolFormFactory<Entity, R>
            entity={entity}
            errors={errors}
            form={form}
            formFields={formFields}
            onChange={onChange}
            bind={bind}
            top={top}
            bottom={bottom}
            elements={elements}
        />
    );
}

export default forwardRef(SmolFormInner) as <Entity>(
    props: SmolFormProps<Entity> & { ref?: ForwardedRef<SmolFormRef<Entity>> }
) => ReturnType<typeof SmolFormInner>;
