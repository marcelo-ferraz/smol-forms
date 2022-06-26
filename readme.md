
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
This hook is the central point of the lib. It concerns itself with entity `validation`, entity `binding` and the entity `value`.

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

## The Validation bit
The goal is to support validation functions. The lib does comes with some default validators, please check it [here](#built-in-validators).    
There are four different parts to interact with:
### The `validate` function
Is returned from the hook, or the reference from the component, and it can trigger a state change saving the validation result, or just return the result (is valid or not).

It can be used to test a single property by the name, `all` properties from the entity or only the `touched` ones.
```ts
// validating only the touched and updating the state
const allDirtyAreValid = validate('touched');

// testing if all fields are valid
const testAllFields = validate('all', true);

// testing only the property 'age' is valid
const testAllFields = validate('age', true);
```

> Is important to note that the validate function won't throw an exception if the field doesn't have a validator or is bound to a field.     
> Meaning if there are no validators bound to the property, it just returns `null`, because nothing was done.

## The validation state 
The validation state is just a dictionary with the same fields but arrays of strings with the description of the error found.

<table>
	<tr>
		<td> The object </td>
		<td> The error map </td>
	</tr>
	<tr>
		<td>

```ts
	const entity = {
		id: 22,
		name: 'joe'
	}
```
    
    
		</td>
		<td>


```ts
// will have a map, if they are invalid:
const entity = {
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

|

|

## The validation state change callback

  - a callback for the change event of those validation error 
 - debouncing
  - the entity value
  - the change event
 - binding
  -   
   
## Built-in validators
<em>under construction</em>