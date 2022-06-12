import React, {
    ReactElement, forwardRef, useImperativeHandle, ForwardedRef,
} from 'react';
import SmolFormFactory from './SmolFormFactory';
import {
    SmolFormRef, SmolFormProps, MinimumToBind, MuiBindProps,
} from './types';
import useSmolForms from './useSmolForm';

function SmolFormInner<
    Entity,
    R extends MinimumToBind<Entity> = MuiBindProps<Entity>
>({
    initial = {},
    form,
    formFields,
    onChange,
    adapter,
    onValidationError,
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
    } = useSmolForms<Entity, R>({
        initial,
        onChange,
        onValidationError,
        adapter,
    });

    useImperativeHandle(ref, () => ({
        bind,
        entity,
        errors,
        setErrors,
        emitFieldChange,
    }), [
        bind,
        entity,
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
