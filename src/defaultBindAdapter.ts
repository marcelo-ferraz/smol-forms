import {
    DefaultBindProps,
    SmolChangeEvent,
    BindFuncArgs,
} from './types';

const defaultBindAdapter = <Entity>({
    selector,
    fieldChangeHandler,
    cfg,
    validationErrors,
    entity,
}: BindFuncArgs<Entity>) : DefaultBindProps<Entity> => {
    const name = (selector ?? new Date()).toString();
    const value = (entity?.display)[selector]
        ?? (entity?.value)[selector]
        ?? cfg?.defaultValue
        ?? null;

    return {
        name,
        'data-key': selector,
        onChange: (ev: SmolChangeEvent) => fieldChangeHandler(ev, selector, cfg),
        error: !!(validationErrors[selector]),
        helperText: (validationErrors)[selector] as string ?? '',
        value,
    };
};

export default defaultBindAdapter;
