
# Welcome to smol-forms

  

HTML form elements work a bit differently from other DOM elements in React because form elements naturally keep some internal state. This small library has the goal of simplifying the binding of DOM, or non-DOM elements to a state, while trying to provide clean and simple usage.

There are amazing frameworks that that deal really well with this problem. This is just my try.

**Under construction...**

This is aimed to be a small and flexible forms lib.

Stay tuned for more.

## Examples

### Simplest use that I can think of with the hook
```ts
  const { bind, entity } =  useSmolForm<EntityType>();
  // ... save implementation
  return (<>
	  <label  for="fname">Name:</label><br/>
	  <input  type="text"  name="fname" {...bind('name')} />
	  <br/>
	  <label  for="age">Name:</label><br/>
	  <input  type="text" name="age" {...bind.int('age')} />
	  <br/>
	  <label  for="mmail">Last  name:</label><br>
	  <input  type="text"  name="mmail" {...bind({mainEmail: [isEmail]})} />
	  <br/>
	  <button  onClick={() => save(entity)} />
  </>);
```
### Simplest use that I can think of with the component
```ts
  // ... save implementation
  return (<SmolForm<EntityType>
	  form={({ bind, entity }) => (
		  <>
			  <label  for="fname">Name:</label><br/>
			  <input  type="text"  name="fname" {...bind('name')} />
			  <br/>
			  <label  for="age">Name:</label><br/>
			  <input  type="text" name="age" {...bind.int('age')} />
			  <br/>
			  <label  for="mmail">Last  name:</label><br>
			  <input  type="text"  name="mmail" {...bind({mainEmail: [isEmail]})} />
			  <br/>
			  <button  onClick={() => save(entity)} />
		  </>
	  )}
	/>);
```

## The API
There are two main ways to use `smol-forms`, the hook (**useSmolForm**) or the component (**SmolForm<T>**). Both have the same-ish signature (the component contains some visual aspects and a ref to the current instance of the engine).
I chose to provide those two endpoints, so you can use what feels more confortable to you.
Their core is the same, which is actually the hook, so there are no surprises when using it. Chose whatever you like and be happy.
### The useSmolForm hook

### Props
| Property          | Type                                        | Default          | Description                                                                                                                                                             |
| ----------------- | ------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| initial           | `object`                                    | `{}`             | The initial value for the entity to be bound.                                                                                                                           |
| delay             | `number`                                    | `300`            | the delay used by the debouncing function.                                                                                                                              |
| onChange          | `SmolChangeCallback<T>`                     | `null`           | A callback for any changes made. This is debounced and is affected by the value of _**`delay`**_.                                                                       |
| onValidationError | ``(errors:  ValidationErrors<T>) =>  void`` | `null`           | A callback for when an validation error is detected                                                                                                                     |
| adapter           | `BindAdapter<T, P>`                         | `defaultAdapter` | An Anti-Corruption Layer, the interactions between the field and engine are dealt here. It has a minimum interface, but can be heavily customized for more, refere here |

#### Return
| Property        | Type                                                                            | Description                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| bind            | `Bind<T, P>`                                                                    | The `bind` function used for hmm..., "binding" the field to a given property, for more info, and how to adapt its behaviour, please check it here |
| emitFieldChange | ``SmolInputChangeHandler<T>``                                                   | The change handler, you can use it at anytime, more info here                                                                                     |
| entity          | `object`                                                                        | The debounced value of the entity                                                                                                                 |
| validate        | ``(selector: keyof  Entity\|'all'\|'touched', justTest?: boolean) =>  boolean`` | The validation function. It accepts ``'all'``, ``'touched'`` or any property name from the entity.                                                |
| errors          | ``ValidationErrors<T>``                                                         | The validation errors. Its a key and `string[]` dictionary.                                                                                       |
| setErrors       | ``Dispatch<SetStateAction<ValidationErrors<T>>>``                               | A dispatch to set errors yourself.                                                                                                                |

