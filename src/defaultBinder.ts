import {
    DefaultBindMappedResult,
    MoreGenericConfigForBind,
    SmolChangeEvent,
    SmolChangeHandler,
    UnbeknownstValues,
} from './types';

export default function defaultBinder<Entity>(
    selector: keyof Entity,
    fieldChangeHandler: SmolChangeHandler<Entity>,
    cfg: MoreGenericConfigForBind<Entity>,
    validationErrors: UnbeknownstValues<Entity>,
    entity: Partial<Entity>,
) : DefaultBindMappedResult<Entity> {
    const name = (selector ?? new Date()).toString();
    return {
        name,
        'data-key': selector,
        onChange: (ev: SmolChangeEvent) => fieldChangeHandler(ev, selector, cfg),
        error: !!(validationErrors[selector]),
        helperText: (validationErrors)[selector] as string ?? '',
        value: (entity)[selector] ?? cfg?.defaultValue ?? null,
    };
}
