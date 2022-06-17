import {
    MuiBindProps,
    SmolChangeEvent,
    BindArgs,
    MinPropsToBind,
} from './types';

export const DEFAULT_VALUE = '';

export const muiAdapter = <Entity>(args: BindArgs<Entity>) : MuiBindProps<Entity> => {
    const name = (args.selector ?? new Date()).toString();

    const def = defaultAdapter(args);

    const errors = args.validationErrors[args.selector];

    return {
        ...def,
        name,
        error: !!errors,
        helperText: errors as string ?? '',
    };
};

const defaultAdapter = <Entity>({
    cfg,
    entity,
    selector,
    fieldBlurHandler,
    fieldChangeHandler,
}: BindArgs<Entity>) : MinPropsToBind => {
    const defaultValue = (
        // if config is provided and defaultValue is provided including null
        !!cfg && cfg.defaultValue !== undefined
    )
        ? cfg.defaultValue
        : DEFAULT_VALUE;

    const value = (
        (entity?.display)[selector]
        ?? (entity?.value)[selector]
        ?? defaultValue
    ) as never;

    return {
        'data-key': selector,
        onChange: (ev: SmolChangeEvent) => fieldChangeHandler(ev, selector, cfg),
        onBlur: fieldBlurHandler,
        value,
    };
};

export default defaultAdapter;
