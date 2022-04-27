import { Dispatch, ReactElement, SetStateAction } from 'react';

export type DefaultBindMappedResult<T> = {
    onChange: SmolChangeHandler<T>;
    error: boolean;
    name: string;
    helperText: string;
    value: unknown;
    'data-key': string | number | symbol;
};

export type BindingOptions<T> = keyof T | Partial<{
    [key in keyof T]: {
        mask?: string;
        parse?: (value: T[key], entity: T) => unknown;
        validators?: Runnable<string, { value: T[key], entity: T }>
            | Runnable<string, { value: T[key], entity: T }>[];
    };
}>;

export type MoreGenericConfigForBind<T> = {
    mask?: string;
    parse?: (value: keyof T, entity: T) => unknown;
    validators?: Runnable<string, Partial<{ value: keyof T, entity: T }>>
        | Runnable<string, Partial<{ value: keyof T, entity: T }>>[];
};

export type BindFunc<
    T,
    R extends MinimumToBindMapper<T> = DefaultBindMappedResult<T>
> = (input: keyof T | BindingOptions<T>) => R;

export type MinimumToBindMapper<T> = {
    onChange: SmolChangeHandler<T>,
    'data-key': string | number | symbol,
};

export type BindMapper<
    Entity,
    R extends MinimumToBindMapper<Entity>
> = (
    selector: keyof Entity,
    fieldChangeHandler: SmolChangeHandler<Entity>,
    cfg: MoreGenericConfigForBind<Entity>,
    validationErrors: UnbeknownstValues<Entity>,
    entity: Partial<Entity>,
) => R;

export type SmolChangeEvent = {
    target: {
        value: unknown;
        type?: string;
        checked?: boolean;
    };
};

export type SmolChangeHandler<T> = (
    ev: SmolChangeEvent,
    selector?: keyof T,
    cfg?: MoreGenericConfigForBind<T>,
) => void;

export type FormHookProps<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
> = {
    initial?: Partial<Entity>,
    onValidationError?: (errors: ValidationErrors<Entity>) => void,
    registrationMapper?: BindMapper<Entity, R>,
}

export type FormHookResult<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
> = {
    bind: BindFunc<Entity, R>;
    emitFieldChange: SmolChangeHandler<Entity>;
    entity: Partial<Entity>;
    setEntity: Dispatch<SetStateAction<Partial<Entity>>>;
    errors: ValidationErrors<Entity>;
    setErrors: Dispatch<SetStateAction<ValidationErrors<Entity>>>;
}

export type FormAndFieldAsArg<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>,
> = {
    entity: Partial<Entity>;
    errors: ValidationErrors<Entity>;
    bind: BindFunc<Entity, R>;
    changeHandler: SmolChangeHandler<Entity>;
}

export type FormFromFunc<
    T,
    R extends MinimumToBindMapper<T> = DefaultBindMappedResult<T>
> = (args: FormAndFieldAsArg<T, R>) => ReactElement;

export type FormFieldsFromFunc<
    T,
    R extends MinimumToBindMapper<T> = DefaultBindMappedResult<T>
> = (args: FormAndFieldAsArg<T, R>) => ReactElement[];

export type Runnable<R, T = unknown> = (val: T) => R;

export type UnbeknownstValues<T> = { [Property in keyof T]: unknown };

export type SmolFormRef<Entity> = FormHookResult<Entity>;

export type SmolFormProps<Entity> = {
    initial?: Partial<Entity>;
    form?: FormFromFunc<Entity>;
    formFields?: FormFieldsFromFunc<Entity>;
    top?: ReactElement | string;
    bottom?: ReactElement | string;
    onChange?: SmolFormFactoryProps<Entity>['onChange']
    onValidationError?(e: ValidationErrors<Entity>): void;
    elements?: SmolFormFactoryProps<Entity>['elements'];
};

export type SmolFormFactoryProps<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>,
> = {
    entity?: Partial<Entity>;
    errors?: ValidationErrors<Entity>;
    form?: FormFromFunc<Entity, R>;
    formFields?: FormFieldsFromFunc<Entity, R>;
    onChange?: FormHookResult<Entity, R>['emitFieldChange'];
    bind?: FormHookResult<Entity, R>['bind'];
    top?: ReactElement | string;
    bottom?: ReactElement | string;
    elements?: {
        wrapper?: ReactElement;
        top?: ReactElement;
        cell?: ReactElement;
        bottom?: ReactElement;
    };
};

export type ValidationErrors<Entity> = Partial<{
    [Property in keyof Entity]: string[];
}> & { _formErrors?: string[] };
