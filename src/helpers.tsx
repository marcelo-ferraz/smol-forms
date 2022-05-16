import {
    BindingInput,
    MoreGenericConfigForBind,
    Runnable,
    Validator,
} from './types';

export function destructureCfg<T>(
    options: BindingInput<T>,
): [keyof T, MoreGenericConfigForBind<T>] {
    let selector = options as keyof T;
    let cfg: MoreGenericConfigForBind<T> = null;

    if (typeof options === 'string') {
        return [selector, cfg];
    }

    const firstProperty = Object.entries(selector)[0];

    if (firstProperty?.length < 1) {
        throw new Error(`Invalid binding input: ${selector}`);
    }

    selector = firstProperty[0] as keyof T;
    const unknownValue = firstProperty[1];

    // this is a short-hand for the event parser
    if (typeof unknownValue === 'function') {
        cfg = {
            parser: unknownValue as Runnable,
        };
    // this is a short-hand for the validators
    } else if (Array.isArray(unknownValue)) {
        cfg = {
            validators: unknownValue as Validator<T, typeof selector>,
        };
    // declarative config object
    } else if (typeof options === 'object') {
        cfg = firstProperty[1] as MoreGenericConfigForBind<T>;
    }

    return [
        selector,
        cfg,
    ];
}

export function runOrReduce<R, T = unknown>(actions: Runnable<R, T> | Runnable<R, T>[], value: T): R[] {
    if (!actions) { return []; }

    const result = Array.isArray(actions)
        ? (actions as Runnable<R, T>[]).map((action) => action(value))
        : [(actions as Runnable<R, T>)(value)];

    return result.filter((res) => res);
}
