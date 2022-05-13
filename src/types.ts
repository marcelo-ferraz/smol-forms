import { Dispatch, ReactElement, SetStateAction } from 'react';

export type DefaultBindProps<Entity> = {
    onChange: SmolInputChangeHandler<Entity>;
    error: boolean;
    name: string;
    helperText: string;
    value: unknown;
    'data-key': string | number | symbol;
};

export type BindingOptionsObj<Entity> = Partial<{
    [key in keyof Entity]: {
        // still not supported
        // mask?: string;
        defaultValue?: unknown;
        type?: (value: Entity[key], entity: Entity) => [unknown, unknown];
        validators?: Runnable<string, { value: Entity[key], entity: Entity }>
            | Runnable<string, { value: Entity[key], entity: Entity }>[];
    };
}>;

export type BindingOptions<Entity> = keyof Entity | BindingOptionsObj<Entity>;

export type MoreGenericConfigForBind<Entity> = {
    mask?: string;
    defaultValue?: unknown;
    type?: (value: unknown, key: keyof Entity, entity: Partial<Entity>) => [unknown, unknown];
    validators?: Runnable<string, Partial<{ selector: keyof Entity, value: unknown, entity: Entity }>>
        | Runnable<string, Partial<{ selector: keyof Entity, value: unknown, entity: Entity }>>[];
};

export type BindingInput<Entity> = keyof Entity | BindingOptions<Entity>;

export interface Bind<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> {
    (input: BindingInput<Entity>): FieldBoundProps;
    float(input: BindingInput<Entity>, args?: NumberArgs): FieldBoundProps;
    int(input: BindingInput<Entity>, args?: IntArgs): FieldBoundProps;
    str(input: BindingInput<Entity>): FieldBoundProps;
}

export type MinimumToBind<T> = {
    onChange: SmolInputChangeHandler<T>,
    'data-key': string | number | symbol,
};

export type BindFuncArgs<Entity> = {
    selector: keyof Entity,
    fieldChangeHandler: SmolInputChangeHandler<Entity>,
    cfg: MoreGenericConfigForBind<Entity>,
    validationErrors: UnbeknownstValues<Entity>,
    entity: DisplayNValue<Entity>,
}

export type BindFunc<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity>
> = (
    args: BindFuncArgs<Entity>
    & { bind: BindFunc<Entity, DefaultBindProps<Entity>> }
) => FieldBoundProps;

export type SmolChangeEvent = {
    target: {
        value: unknown;
        type?: string;
        checked?: boolean;
    };
};

export type SmolInputChangeHandler<Entity> = (
    ev: SmolChangeEvent,
    selector?: keyof Entity,
    cfg?: MoreGenericConfigForBind<Entity>,
) => void;

export type SmolChangeCallback<Entity> = (args: {
    event: SmolChangeEvent;
    selector?: keyof Entity;
    cfg?: MoreGenericConfigForBind<Entity>;
    entity: Partial<Entity>;
    prevEntity: Partial<Entity>;
    entityDisplay: Partial<{ [key in keyof Entity]: unknown; }>;
    prevEntityDisplay: Partial<{ [key in keyof Entity]: unknown; }>;
}) => void | DisplayNValue<Entity>;

export type FormHookProps<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = {
    initial?: Partial<Entity>,
    onValidationError?: (errors: ValidationErrors<Entity>) => void,
    adapter?: BindFunc<Entity, FieldBoundProps>,
    onChange?: SmolChangeCallback<Entity>,
    debounceChange?: number,
}

export type FormHookResult<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = {
    bind: Bind<Entity, FieldBoundProps>;
    emitFieldChange: SmolInputChangeHandler<Entity>;
    entity: Partial<Entity>;
    // setEntity: Dispatch<SetStateAction<Partial<Entity>>>;
    errors: ValidationErrors<Entity>;
    setErrors: Dispatch<SetStateAction<ValidationErrors<Entity>>>;
}

export type FormAndFieldAsArg<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>,
> = {
    entity: Partial<Entity>;
    errors: ValidationErrors<Entity>;
    bind: Bind<Entity, FieldBoundProps>;
    changeHandler: SmolChangeCallback<Entity>;
}

export type FormFromFunc<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = (args: FormAndFieldAsArg<Entity, FieldBoundProps>) => ReactElement;

export type FormFieldsFromFunc<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = (args: FormAndFieldAsArg<Entity, FieldBoundProps>) => ReactElement[];

export type Runnable<R, T = unknown> = (val: T) => R;

export type UnbeknownstValues<T> = { [Property in keyof T]: unknown };

export type SmolFormRef<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = FormHookResult<Entity, FieldBoundProps>;

export type SmolFormProps<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = FormHookProps<Entity, FieldBoundProps> & {
    form?: FormFromFunc<Entity, FieldBoundProps>;
    formFields?: FormFieldsFromFunc<Entity, FieldBoundProps>;
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
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>,
> = {
    entity?: Partial<Entity>;
    errors?: ValidationErrors<Entity>;
    form?: FormFromFunc<Entity, FieldBoundProps>;
    formFields?: FormFieldsFromFunc<Entity, FieldBoundProps>;
    onChange?: SmolChangeCallback<Entity>;
    bind?: FormHookResult<Entity, FieldBoundProps>['bind'];
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

export type DisplayNValue<Entity> = {
    value: Partial<Entity>;
    display: Partial<{ [key in keyof Entity]: unknown; }>
}

export type NumberArgs = { min?: number, max?: number };
export type IntArgs = NumberArgs & { radix?:number };
