import defaultBindAdapter from './bindAdapters';

import { destructureCfg } from './helpers';
import { int, float } from './inputTypes';
import {
    ValidationErrors,
    MinimumToBind,
    SmolInputChangeHandler,
    MoreGenericConfigForBind,
    BindingInput,
    DisplayNValue,
    IntArgs,
    NumberArgs,
    BindAdapter,
} from './types';

function binderFactory<
    Entity,
    FieldBoundProps extends MinimumToBind<Entity>
>(
    entity: DisplayNValue<Entity>,
    validationErrors: ValidationErrors<Entity>,
    adapter: BindAdapter<Entity, FieldBoundProps>,
    fieldChangeHandler: SmolInputChangeHandler<Entity>,
    onBinding: OnBindingCallback<Entity>,
) {
    const coreFunc = (
        selector: keyof Entity,
        cfg: MoreGenericConfigForBind<Entity>,
        changeHandler: SmolInputChangeHandler<Entity>,
    ) => {
        const bind = () => defaultBindAdapter<Entity>({
            selector,
            fieldChangeHandler: changeHandler,
            cfg,
            validationErrors,
            entity,
        });

        if (adapter) {
            return adapter({
                selector,
                fieldChangeHandler: changeHandler,
                cfg,
                validationErrors,
                entity,
                bind,
            });
        }

        return bind() as unknown as FieldBoundProps;
    };

    const mainFunc = (input: BindingInput<Entity>): FieldBoundProps => {
        const [selector, cfg] = destructureCfg<Entity>(input);

        return coreFunc(selector, cfg, fieldChangeHandler);
    };

    mainFunc.int = (input: BindingInput<Entity>, args?: IntArgs) => {
        const [selector, config] = destructureCfg<Entity>(input);

        const type = (value: unknown) => int(value, args);

        return coreFunc(
            selector,
            config ? { ...config, type } : { type },
            fieldChangeHandler,
        );
    };

    mainFunc.float = (input: BindingInput<Entity>, args?: NumberArgs) => {
        const [selector, config] = destructureCfg<Entity>(input);

        const type = (value: unknown) => float(value, args);

        return coreFunc(
            selector,
            config ? { ...config, type } : { type },
            fieldChangeHandler,
        );
    };

    mainFunc.nullable = (input: BindingInput<Entity>) => {
        const [selector, config] = destructureCfg<Entity>(input);

        const defaultValue: unknown = null;

        return coreFunc(
            selector,
            config ? { ...config, defaultValue } : { defaultValue },
            fieldChangeHandler,
        );
    };

    return mainFunc;
}

export default binderFactory;
