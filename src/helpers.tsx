import { BindingOptions, MoreGenericConfigForBind, Runnable, SmolChangeHandler } from "./types";

export function destructureCfg<T>(
    options: keyof T | BindingOptions<T>,
): [keyof T, MoreGenericConfigForBind<T>] {
    let selector = options as keyof T;
    let cfg: MoreGenericConfigForBind<T> = null;
    if (typeof selector !== 'string') {
        const firstProperty = Object.entries(selector)[0];
        selector = firstProperty[0] as keyof T;
        // eslint-disable-next-line prefer-destructuring
        cfg = firstProperty[1];
    }

    return [
        selector,
        cfg,
    ];
}

export function runOrReduce<R, T = unknown>(actions: Runnable<R, T> | Runnable<R, T>[], value: T): R[] {
    if (!actions) { return []; }

    const result = !actions.length
        ? (actions as Runnable<R, T>[]).map((action) => action(value))
        : [(actions as Runnable<R, T>)(value)];

    return result.filter((res) => res);
}

export function addCallbackOnChange<Entity>(
    options: keyof Entity | BindingOptions<Entity>,
    inputChange: SmolChangeHandler<Entity>,
    changeCallback: SmolChangeHandler<Entity>,
) {
    const [selector, cfg] = destructureCfg(options);

    const changeHandler: SmolChangeHandler<Entity> = (ev) => {
        inputChange(ev, selector, cfg);

        if (changeCallback) {
            changeCallback(ev, selector, cfg);
        }
    };
    return changeHandler;
}
