# Welcome to smol-forms

HTML form elements work a bit differently from other DOM elements in React because form elements naturally keep some internal state. This small library has the goal of simplifying the biding of DOM, or non-DOM elements to a state. 
```ts
const { bind, entity, errors } = useSmolForm<EntityType>();

return (<>
	<input type="text" {...bind('propertyString')} />
	<input type="text" {...bind.int('propertyNumber')} />
	<input type="text" {...bind({propertyEmail: [isEmail]})} />
</>);
```

There are awesome frameworks that tackle this problem. I just want to have my go.

**Under construction...**
This is aimed to be a small and flexible forms lib.
Stay tuned for more.