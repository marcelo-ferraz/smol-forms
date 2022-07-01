import { Dispatch, ReactElement, SetStateAction } from 'react';

type OnlyOneProp<T> = keyof T extends infer K
    ? K extends unknown
    ? { [key in keyof T]?: key extends K ? T[key] : never }
    : never
    : never;

export type MuiBindProps = MinPropsToBind & {
    error: boolean;
    name: string;
    helperText: string;
};

export type BindingOptionsObjProp<
    Entity = unknown,
    key extends keyof Entity = keyof Entity
> = {
        // still not supported
        // mask?: string;
        defaultValue?: unknown;
        eventMap?: Runnable;
        type?: (value: Entity[key], key: keyof Entity, entity: Entity) => [unknown, unknown];
        validators?: Validator<Entity, key> | Validator<Entity, key>[];
}

export type BindingOptionsObj<Entity> = OnlyOneProp<{
    [Key in keyof Entity]: BindingOptionsObjProp<Entity, Key>
}>;

export type MoreGenericConfigForBind<Entity = unknown> = {
    mask?: string;
    defaultValue?: unknown;
    eventMap?: Runnable;
    type?: (value: unknown, key: keyof Entity, entity: Partial<Entity>) => [unknown, unknown];
    validators?: Validator<Entity> | Validator<Entity>[];
};

export type ValidatorArgs<
    Entity = unknown,
    key extends keyof Entity = keyof Entity
> = Partial<{
    selector: keyof Entity,
    value: Entity[key],
    entity: Entity,
}>;

export type Validator<
    Entity,
    Key extends keyof Entity = keyof Entity
> = Runnable<string, ValidatorArgs<Entity, Key>>;

export type BindingInput<Entity> = keyof Entity
| BindingOptionsObj<Entity>
| OnlyOneProp<{
    [key in keyof Entity]:
        Runnable
        | (Validator<Entity, key>[]);
}>;

export interface Bind<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> {
    (input: BindingInput<Entity>): FieldBoundProps;
    float(input: BindingInput<Entity>, args?: NumberArgs): FieldBoundProps;
    int(input: BindingInput<Entity>, args?: IntArgs): FieldBoundProps;
    nullable(input: BindingInput<Entity>): FieldBoundProps;
}

export type MinPropsToBind = {
    onChange: Runnable,
    onBlur: () => void,
    'data-key': string | number | symbol,
    value: never,
};

export type BindArgs<Entity> = {
    selector: keyof Entity,
    fieldChangeHandler: SmolInputChangeHandler<Entity>,
    fieldBlurHandler: () => void,
    cfg: MoreGenericConfigForBind<Entity>,
    validationErrors: UnbeknownstValues<Entity>,
    entity: DisplayNValue<Entity>,
}

export type BindAdapterArgs<Entity> = BindArgs<Entity> & {
    bind: () => MinPropsToBind,
}

export type BindAdapter<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> = (args: BindAdapterArgs<Entity>) => FieldBoundProps;

export type SmolChangeEvent = {
    target: {
        value: string | number | readonly string[] | unknown;
        type?: string;
        checked?: boolean;
    };
};

export type SmolInputChangeHandler<Entity = unknown> = MoreGenericConfigForBind['eventMap'] | (
    (
        ev: SmolChangeEvent,
        selector?: keyof Entity,
        cfg?: MoreGenericConfigForBind<Entity>,
    ) => void
);

export type OnBindingCallback<Entity> = (
    selector: keyof Entity, config: MoreGenericConfigForBind<Entity>
) => void

export type SmolChangeCallbackArgs<Entity> = {
    event: SmolChangeEvent;
    value: unknown;
    selector?: keyof Entity;
    cfg?: MoreGenericConfigForBind<Entity>;
    entity: Partial<Entity>;
    prevEntity: Partial<Entity>;
    entityDisplay: Partial<{ [key in keyof Entity]: unknown; }>;
    prevEntityDisplay: Partial<{ [key in keyof Entity]: unknown; }>;
};

export type SmolChangeCallback<Entity> = (
    args: SmolChangeCallbackArgs<Entity>,
) => void | DisplayNValue<Entity>;

export type FormHookProps<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> = {
    initial?: Partial<Entity>;
    onValidationError?: (errors: ValidationErrors<Entity>) => void;
    adapter?: BindAdapter<Entity, FieldBoundProps>;
    onChange?: SmolChangeCallback<Entity>;
    delay?: number;
}

export type FormHookResult<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> = {
    bind: Bind<Entity, FieldBoundProps>;
    emitFieldChange: SmolInputChangeHandler<Entity>;
    entity: Partial<Entity>;
    validate(selector: keyof Entity | 'all' | 'touched', justTest?: boolean): boolean,
    errors: ValidationErrors<Entity>;
    setErrors: Dispatch<SetStateAction<ValidationErrors<Entity>>>;
}

export type FormAndFieldAsArg<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind,
> = {
    entity: Partial<Entity>;
    errors: ValidationErrors<Entity>;
    bind: Bind<Entity, FieldBoundProps>;
    changeHandler: SmolChangeCallback<Entity>;
}

export type FormFromFunc<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> = (args: FormAndFieldAsArg<Entity, FieldBoundProps>) => ReactElement;

export type FormFieldsFromFunc<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> = (args: FormAndFieldAsArg<Entity, FieldBoundProps>) => ReactElement[];

export type Runnable<R = unknown, T = unknown> = (val: T) => R;

export type UnbeknownstValues<T> = { [Property in keyof T]: unknown };

export type SmolFormRef<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
> = FormHookResult<Entity, FieldBoundProps>;

export type SmolFormProps<
    Entity,
    FieldBoundProps extends MinPropsToBind = MinPropsToBind
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
    FieldBoundProps extends MinPropsToBind = MinPropsToBind,
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

export type FieldsMetadata<Entity> = Partial<{
    [key in keyof Entity]: MoreGenericConfigForBind<Entity> & { touched?: boolean};
}>;
