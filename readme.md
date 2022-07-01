

# Welcome to smol-forms

  

HTML form elements work a bit differently from other DOM elements in React because form elements naturally keep some internal state. This small library has the goal of simplifying the binding of DOM, or non-DOM elements to a state while trying to provide clean and simple usage.

There are amazing frameworks that deal with these problems very well. This is just my try.

**Under construction...**

This is aimed to be a small and flexible forms lib.

Stay tuned for more.

## Examples

### Simplest use that I can think of with the hook
```ts
  const { bind, entity } =  useSmolForm<EntityType>();
  // ... save implementation
  return (<>
    <label for="fname">Name:</label>
    <br/>
    <input type="text"  name="fname" {...bind('name')} />
    <br/>
    <label for="age">Name:</label>
    <br/>
    <input type="text" name="age" {...bind.int('age')} />
    <br/>
    <label for="mmail">Last  name:</label>
    <br/>
    <input type="text"  name="mmail" {...bind({mainEmail: [isEmail]})} />
    <br/>
    <button onClick={() => save(entity)} />
  </>);
```
### Simplest use that I can think of with the component
```ts
// ... save implementation
return (<SmolForm<EntityType>
  form={({ bind, entity }) => (
    <>
      <label for="fname">Name:</label>
      <br/>
      <input type="text"  name="fname" {...bind('name')} />
      <br/>
      <label for="age">Name:</label>
      <br/>
      <input type="text" name="age" {...bind.int('age')} />
      <br/>
      <label for="mmail">Last  name:</label>
      <br/>
      <input type="text"  name="mmail" {...bind({mainEmail: [isEmail]})} />
      <br/>
      <button  onClick={() => save(entity)} />
    </>
  )}
/>);
```

## The API
There are two main ways to use `smol-forms` a hook, **useSmolForm**, and a component, **SmolForm<T>**. The hook is the core, while the component encapsulates it and adds visual support. The choice between using smol-forms as a hook or as a component comes down to personal preference.
  
### The useSmolForm hook
This hook is the central point of the lib. It concerns itself with entity `validation`, entity `binding`, and the entity `value`.

### Props
| Property          | Type                                        | Default          | Description                                                                                                                                                                            |
| ----------------- | ------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| initial           | `object`                                    | `{}`             | The initial value for the entity to be bound.                                                                                                                                          |
| delay             | `number`                                    | `300`            | the delay used by the debouncing function.                                                                                                                                             |
| onChange          | `SmolChangeCallback<T>`                     | `null`           | A callback for any changes made. This is debounced and is affected by the value of _**`delay`**_.                                                                                      |
| onValidationError | ``(errors:  ValidationErrors<T>) =>  void`` | `null`           | A callback for when a validation error is detected                                                                                                                                     |
| adapter           | `BindAdapter<T, P>`                         | `defaultAdapter` | It is an Anti-Corruption Layer. The interactions between the field and the engine are dealt with here. It has a minimal interface but can be heavily customized. For more, refer here. |

#### Return
| Property        | Type                                                                            | Description                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| bind            | `Bind<T, P>`                                                                    | The `bind` function used for hmm..., "binding" the field to a given property, for more info, and how to adapt its behavior, please check it here |
| emitFieldChange | ``SmolInputChangeHandler<T>``                                                   | The change handler, you can use it at any time, more info here                                                                                   |
| entity          | `object`                                                                        | The debounced value of the entity                                                                                                                |
| validate        | ``(selector: keyof  Entity\|'all'\|'touched', justTest?: boolean) =>  boolean`` | The validation function. It accepts ``'all'``, ``'touched'`` or any property name from the entity.                                               |
| errors          | ``ValidationErrors<T>``                                                         | The validation errors. It's a key and `string[]` dictionary.                                                                                     |
| setErrors       | ``Dispatch<SetStateAction<ValidationErrors<T>>>``                               | A dispatch to set errors yourself.                                                                                                               |

## The state bit
### The debounced entity state
This ensures that neither time-consuming tasks nor callbacks are fired too often. As much of the framework is about the state synchronization, a lack of control here can create race conditions.
The default delay is _`100ms`_.

### The state change callback `onChange`
Both hook and component have a callback for when the state is updated. 
The type, `(args: SmolChangeCallbackArgs<Entity>) => void`.

#### The args Object
| Property          | Type                               | Description                                                                               |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| event             | `SmolChangeEvent`                  | Is the event that triggered the last change                                               |
| value             | `any`                              | The value for that change, can be overridden by configuration, by the `eventMap` function |
| selector          | `keyof Entity`                     | the property that was modified on this event                                              |
| cfg               | `MoreGenericConfigForBind<Entity>` | the configuration bound to the field                                                      |
| entity            | `Partial<Entity>`                  | the current state of the entity                                                           |
| prevEntity        | `Partial<Entity>`                  | the previous state of the entity                                                          |
| entityDisplay     | `Partial<Entity>`                  | the current state of the entity fields display data                                       |
| prevEntityDisplay | `Partial<Entity>`                  | the current state of the entity fields display data                                       |

## The Validation bit
The goal is to support validation functions. The lib does come with some default validators, please check it [here](#built-in-validators).    
There are four different parts to interact with:
### The `validate` function
Is returned from the hook, or the reference from the component, and it can trigger a state change saving the validation result, or just return the result (is valid or not).

It can be used to test a single property by the name, `all` properties from the entity, or only the `touched` ones.
```ts
// validating only the touched and updating the state
const allDirtyAreValid = validate('touched');

// testing if all fields are valid
const testAllFields = validate('all', true);

// testing only the property 'age' is valid
const testAllFields = validate('age', true);
```

> Note, the validate function won't throw an exception if the field has no validator, or the property is not bound to a field. It'll simply return a null response as nothing was done.

### The validation state 
The state validation is just a dictionary with the same fields but arrays of strings with the description of the error found.

I reckon that the visual representation speaks volumes:
<table>
    <tr>
        <td> The object </td>
        <td> What the error map could look like</td>
    </tr>
    <tr>
        <td>

```js
{
  id: 22,
  name: 'joe'
}
```     
</td>
<td>

```js
{
  id: [ 
    'This field is required!',
    'This field is a number!'
  ],
  name: [ 'this field is required' ],
}
```
</td>
</tr>
</table>


### The validation state change callback `onValidationError`
Both hook and component have a callback for when the error state is updated. 
The type is a `(errors: ValidationErrors<Entity>) => void` where `errors` is the validation state at that moment.     

It will be triggered whenever the `validation` function is called.

> If triggered by the **_onBlur_** event, the validation will be queued to be executed after the debounced delay, and that will trigger this callback afterward.

   
## Built-in validators
<em>under construction</em>
