import { Dispatch, ReactElement, SetStateAction } from 'react';

type OnlyOne<T> = keyof T extends infer K
    ? K extends unknown
    ? { [key in keyof T]?: key extends K ? T[key] : never }
    : never
    : never;

export type DefaultBindProps<Entity> = {
    onChange: SmolInputChangeHandler<Entity>;
    error: boolean;
    name: string;
    helperText: string;
    value: never;
    'data-key': string | number | symbol;
};

export type Validator<
    Entity,
    key extends keyof Entity
> = Runnable<string, { value: Entity[key], entity: Entity }>
| Runnable<string, { value: Entity[key], entity: Entity }>[];

export type BindingOptionsObj<Entity> = OnlyOne<{
    [key in keyof Entity]: {
        // still not supported
        // mask?: string;
        changeWait?: number;
        defaultValue?: unknown;
        parser?: Runnable;
        type?: (value: Entity[key], entity: Entity) => [unknown, unknown];
        validators?: Validator<Entity, key>;
    }
}>;

export type MoreGenericConfigForBind<Entity> = {
    mask?: string;
    changeWait?: number;
    defaultValue?: unknown;
    parser?: Runnable;
    type?: (value: unknown, key: keyof Entity, entity: Partial<Entity>) => [unknown, unknown];
    validators?: Runnable<string, Partial<{ selector: keyof Entity, value: unknown, entity: Entity }>>
        | Runnable<string, Partial<{ selector: keyof Entity, value: unknown, entity: Entity }>>[];
};

export type BindingInput<Entity> = keyof Entity
| BindingOptionsObj<Entity>
| OnlyOne<{
    [key in keyof Entity]:
        Runnable
        | (Validator<Entity, key>[]);
}>;

export interface Bind<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> {
    (input: BindingInput<Entity>): FieldBoundProps;
    float(input: BindingInput<Entity>, args?: NumberArgs): FieldBoundProps;
    int(input: BindingInput<Entity>, args?: IntArgs): FieldBoundProps;
    nullable(input: BindingInput<Entity>): FieldBoundProps;
}

export type MinimumToBind<T> = {
    onChange: SmolInputChangeHandler<T>,
    'data-key': string | number | symbol,
};

export type BindArgs<Entity> = {
    selector: keyof Entity,
    fieldChangeHandler: SmolInputChangeHandler<Entity>,
    cfg: MoreGenericConfigForBind<Entity>,
    validationErrors: UnbeknownstValues<Entity>,
    entity: DisplayNValue<Entity>,
}

export type BindAdapterArgs<Entity> = BindArgs<Entity> & {
    bind: () => DefaultBindProps<Entity>,
}

export type BindAdapter<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = (args: BindAdapterArgs<Entity>) => FieldBoundProps;

export type SmolChangeEvent = {
    target: {
        value: string | number | readonly string[] | unknown;
        type?: string;
        checked?: boolean;
    };
};

export type SmolInputChangeHandler<Entity> = MoreGenericConfigForBind<Entity>['parser'] | (
    (
        ev: SmolChangeEvent,
        selector?: keyof Entity,
        cfg?: MoreGenericConfigForBind<Entity>,
    ) => void
);

export type SmolChangeCallbackArgs<Entity> = {
    event: SmolChangeEvent;
    selector?: keyof Entity;
    cfg?: MoreGenericConfigForBind<Entity>;
    entity: Partial<Entity>;
    prevEntity: Partial<Entity>;
    entityDisplay: Partial<{ [key in keyof Entity]: unknown; }>;
    prevEntityDisplay: Partial<{ [key in keyof Entity]: unknown; }>;
};

export type SmolChangeCallback<Entity> = (args: SmolChangeCallbackArgs<Entity>) => void | DisplayNValue<Entity>;

export type FormHookProps<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = {
    initial?: Partial<Entity>;
    onValidationError?: (errors: ValidationErrors<Entity>) => void;
    adapter?: BindAdapter<Entity, FieldBoundProps>;
    onChange?: SmolChangeCallback<Entity>;
}

export type FormHookResult<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity> = DefaultBindProps<Entity>
> = {
    bind: Bind<Entity, FieldBoundProps>;
    emitFieldChange: SmolInputChangeHandler<Entity>;
    entity: Partial<Entity>;
    validate(): void,
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

export type Runnable<R = unknown, T = unknown> = (val: T) => R;

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
