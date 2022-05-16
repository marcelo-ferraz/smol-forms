import {
    DefaultBindProps,
    SmolChangeEvent,
    BindArgs,
} from './types';

// the debouncing is killing the value
// need to debug properly to understand what is happening
// so for now is disabled
// export const DEFAULT_CHANGE_WAIT = 300;
// function debounce2(func: (...args: unknown[]) => void, timeout = 300) {
//     let timer: number;
//     return (...args: unknown[]): void => {
//         clearTimeout(timer);
//         timer = setTimeout(
//             () => {
//                 console.log(args);
//                 func.apply(this, args);
//             },
//             timeout,
//         ) as unknown as number;
//     };
// }

export const DEFAULT_VALUE = '';

const defaultAdapter = <Entity>({
    selector,
    fieldChangeHandler,
    cfg,
    validationErrors,
    entity,
}: BindArgs<Entity>) : DefaultBindProps<Entity> => {
    const name = (selector ?? new Date()).toString();
    const defaultValue = (
        // if config is provided and defaultValue is provided including null
        !!cfg && cfg.defaultValue !== undefined
    )
        ? cfg.defaultValue
        : DEFAULT_VALUE;

    const value = (entity?.display)[selector]
        ?? (entity?.value)[selector]
        ?? defaultValue;

    return {
        name,
        'data-key': selector,
        onChange: (ev: SmolChangeEvent) => fieldChangeHandler(ev, selector, cfg),
        error: !!(validationErrors[selector]),
        helperText: (validationErrors)[selector] as string ?? '',
        value,
    };
};

export default defaultAdapter;
