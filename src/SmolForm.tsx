import React, {
    ReactElement, forwardRef, useImperativeHandle, ForwardedRef,
} from 'react';
import SmolFormFactory from './SmolFormFactory';
import {
    SmolFormRef, SmolFormProps, MinPropsToBind, MuiBindProps,
} from './types';
import useSmolForms from './useSmolForm';

function SmolFormInner<
    Entity,
    R extends MinPropsToBind = MinPropsToBind
>({
    initial = {},
    form,
    formFields,
    onChange,
    adapter,
    onValidationError,
    delay,
    top,
    bottom,
    elements,
}: SmolFormProps<Entity, R>,
ref: ForwardedRef<SmolFormRef<Entity, R>>): ReactElement {
    const {
        entity,
        errors,
        bind,
        setErrors,
        emitFieldChange,
        validate,
    } = useSmolForms<Entity, R>({
        initial,
        onChange,
        onValidationError,
        adapter,
        delay,
    });

    useImperativeHandle(ref, () => ({
        bind,
        entity,
        errors,
        setErrors,
        emitFieldChange,
        validate,
    }), [bind, entity, errors, setErrors, emitFieldChange, validate]);

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
