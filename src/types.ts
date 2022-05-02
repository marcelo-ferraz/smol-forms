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
    parse?: (value: unknown, key: keyof T, entity: Partial<T>) => unknown;
    validators?: Runnable<string, Partial<{ value: keyof T, entity: T }>>
        | Runnable<string, Partial<{ value: keyof T, entity: T }>>[];
};

export type BindingInput<T> = keyof T | BindingOptions<T>;

export interface Bind<
    T,
    R extends MinimumToBindMapper<T> = DefaultBindMappedResult<T>
> {
    (input: BindingInput<T>): R;
    float(input: BindingInput<T>): R;
    int(input: BindingInput<T>, radix?: number): R;
}

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
    onChange?: SmolChangeHandler<Entity>,
}

export type FormHookResult<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
> = {
    bind: Bind<Entity, R>;
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
    bind: Bind<Entity, R>;
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

export type SmolFormRef<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
> = FormHookResult<Entity, R>;

export type SmolFormProps<
    Entity,
    R extends MinimumToBindMapper<Entity> = DefaultBindMappedResult<Entity>
> = FormHookProps<Entity, R> & {
    form?: FormFromFunc<Entity, R>;
    formFields?: FormFieldsFromFunc<Entity, R>;
    top?: ReactElement | string;
    bottom?: ReactElement | string;
    elements?: {
        container?: ReactElement;
        cell?: ReactElement;
        top?: ReactElement;
        bottom?: ReactElement;
    };
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
