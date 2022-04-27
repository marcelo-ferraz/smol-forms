import React, {
    ReactElement, forwardRef, useImperativeHandle, ForwardedRef,
} from 'react';
import SmolFormFactory from './SmolFormFactory';
import { SmolFormRef, SmolFormProps } from './types';
import useSmolForms from './useSmolForms';
import useToAddCallbackOnChange from './useToAddCallbackOnChange';

function SmolFormInner<Entity>({
    initial = {},
    form,
    formFields,
    onChange,
    onValidationError,
    top,
    bottom,
}: SmolFormProps<Entity>,
ref: ForwardedRef<SmolFormRef<Entity>>): ReactElement {
    const {
        entity,
        setEntity,
        errors,
        bind: binderFromHook,
        setErrors,
        emitFieldChange,
    } = useSmolForms<Entity>({
        initial,
        onValidationError,
    });

    const bind = useToAddCallbackOnChange(binderFromHook, onChange);

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
        <SmolFormFactory
            entity={entity}
            errors={errors}
            form={form}
            formFields={formFields}
            onChange={onChange}
            bind={bind}
            top={top}
            bottom={bottom}
        />
    );
}

export default forwardRef(SmolFormInner) as <Entity>(
    props: SmolFormProps<Entity> & { ref?: ForwardedRef<SmolFormRef<Entity>> }
) => ReturnType<typeof SmolFormInner>;
