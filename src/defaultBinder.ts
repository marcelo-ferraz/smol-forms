import {
    SmolInputChangeHandler,
    MoreGenericConfigForBind,
    UnbeknownstValues,
    DefaultBindMappedResult,
    SmolChangeEvent,
} from './types';

export default function defaultBinder<Entity>(
    selector: keyof Entity,
    fieldChangeHandler: SmolInputChangeHandler<Entity>,
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
