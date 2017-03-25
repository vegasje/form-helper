# Form Helper

This jQuery plugin helps with form validation and serialization.

## Minimal Example

The following example shows how to quickly set up and validate a login form.

Our validations require that both the email and password form fields are at least 4 characters in length.

```html
<form class="login-form">
	<input name="email" type="text" value="name@email.com" /><br />
	<input name="password" type="password" value="mypassword" /><br />
	<br />
	<a class="login-button" href="#">Login</a>
</form>
```

```javascript
var loginFormHelper = $('.login-form').FormHelper({
	fields: {
		email: {
			validate: [FormHelper.validations.minLength(4)]
		},
		password: {
			validate: [FormHelper.validations.minLength(4)]
		}
	}
});

$('.login-button').click(function(e) {
	e.preventDefault();

	if (!loginFormHelper.validate()) {
		return;
	}

	var state = loginFormHelper.currentState();

	// state now contains a JSON representation of the form data:
	// {
	// 	email:    'name@email.com',
	// 	password: 'mypassword'
	// }
});
```

With the default settings, any field that did not meet the validation requirements would now have an `error` class applied to it.

The default settings also check to see if the input is wrapped in a `<fieldset>` tag, in which case the `error` class is applied to that instead.

## Show-Me-Every-Option Example

The following example shows how to create a highly-customized signup form.

```html
<form class="signup-form">
	<div class="field-wrapper">
		<label>Enter your email address</label>
		<input name="email" type="text" value="name@email.com" />
	</div>

	<div class="field-wrapper">
		<label>Enter your password</label>
		<input name="password1" type="password" value="mypassword" />
	</div>

	<div class="field-wrapper">
		<label>Confirm your password</label>
		<input name="password2" type="password" value="mypassword" />
	</div>
	
	<a class="signup-button" href="#">Create Account</a>
</form>
```

```javascript
var signupFormHelper = $('.signup-form').FormHelper({
	// The global `onFail` method runs whenever any field fails validation.
	// `this` represents the field.
	onFail: function() {
		$(this).parent().addClass('red');
	},

	// The global `onPass` method runs whenever any field passes validation.
	// `this` represents the field.
	onPass: function() {
		$(this).parent().removeClass('red');
	},

	fields: {
		email: {
			validate: [
				FormHelper.validations.minLength(4),

				// This validation ensures that the email address has an @ symbol in it.
				function(value) {
					return (value.indexOf('@') !== -1);
				}
			]
		},

		password1: {
			validate: [FormHelper.validations.minLength(4)]
		},

		password2: {
			validate: [
				FormHelper.validations.minLength(4),

				// This validation verifies that the passwords match.
				function(value) {
					return (value === $('[name="password1"]').val());
				}
			],

			// When `password2` fails to validate, highlight both password1 and password2 fields.
			onFail: function() {
				$('[name="password1"]').parent().addClass('red');
				$(this).parent().addClass('red');
			},

			// When `password2` validates, remove any highlights on password1 and password2 fields.
			onPass: function() {
				$('[name="password1"]').parent().removeClass('red');
				$(this).parent().removeClass('red');
			}
		}
	}
});

$('.signup-button').click(function(e) {
	e.preventDefault();

	if (!signupFormHelper.validate()) {
		return;
	}

	var state = signupFormHelper.currentState();

	// state now contains a JSON representation of the form data:
	// {
	// 	email:    'name@email.com',
	// 	password1: 'mypassword',
	// 	password2: 'mypassword'
	// }
});
```

## Form Elements With Multiple Values

The `currentState` method is capable of generating lists of values if the name of the form elements have the same name and end with `[]`.

```html
<form class="friends-form">
	<label>Enter up to 3 names of your friends.</label>
	<input name="friends[]" type="text" value="sally" /><br />
	<input name="friends[]" type="text" value="jane" /><br />
	<input name="friends[]" type="text" value="paul" /><br />
	<br />
	<a class="friends-button" href="#">Login</a>
</form>
```

```javascript
var friendsFormHelper = $('.friends-form').FormHelper();

$('.friends-button').click(function(e) {
	e.preventDefault();

	var state = friendsFormHelper.currentState();

	// state now contains a JSON representation of the form data:
	// {
	// 	friends: [
	// 		'sally',
	// 		'jane',
	// 		'paul'
	// 	]
	// }
});
```

## Forms With Ignored Fields

Sometimes you will have certain elements in your forms that you would like to ignore when fetching the form's state with `currentState`.  The `ignored` configuration option allows you to accomplish this.

`ignored` is an array.  It accepts strings, which ignore based on the name of the field, as well as objects, which ignore based on a jQuery selector.  The following example showcases both methods.

```html
<form class="ignored-form">
	<input class="ignored" name="ignored1" type="hidden" value="test ignore 1" />
	<input class="ignored" name="ignored2" type="hidden" value="test ignore 2" />
	<label>City</label> <input name="city" value="Walnut Creek" /><br />
	<label>State</label> <input name="state" value="CA" /><br />
	<label>Country</label> <input name="country" value="USA" /><br />
	<button class="ignored-button">Test</button>
</form>
```

```javascript
var ignoredFormHelper = $('.ignored-form').FormHelper({
	ignored: [
		{ selector: '.ignored' },
		'country'
	]
});

$('.ignored-button').click(function(e) {
	e.preventDefault();
	
	var state = ignoredFormHelper.currentState();

	// state now contains a JSON representation of the form data:
	// {
	// 	city: 'Walnut Creek',
	// 	state: 'CA'
	// }
});
```

## Using Selectors to Populate State

Sometimes your form fields don't have `name` attributes, or the `name` attributes are formatted differently from how you would like your state object to be formatted.  FormHelper can also use selectors to retrieve field state.

```html
<form class="selector-form">
	<input name="city" type="hidden" value="Laurys Station" />
	<label>City</label><br />
	<input class="city" type="text" value="Walnut Creek" /><br />
	<label>State</label><br />
	<input class="state" type="text" value="CA" /><br />
	<button class="selector-button">Test</button>
</form>
```

```javascript
var selectorFormHelper = $('.selector-form').FormHelper({
	fields: {
		city: {
			selector: '.city',
			validate: [FormHelper.validations.notEmpty()]
		},
		state: {
			selector: '.state',
			validate: [FormHelper.validations.notEmpty()]
		}
	}
});

$('.selector-form .selector-button').click(function(e) {
	e.preventDefault();

	if (!selectorFormHelper.validate()) {
		return;
	}

	var state = selectorFormHelper.currentState();
	
	// state now contains a JSON representation of the form data:
	// {
	// 	city: 'Walnut Creek',
	// 	state: 'CA'
	// }
});
```

This also works for arrays of values.

```html
<form class="selector-array-form">
	<label>Enter up to 3 names of your friends.</label><br />
	<input class="friend" type="text" value="Jane" /><br />
	<input class="friend" type="text" value="Jake" /><br />
	<input class="friend" type="text" value="Sally" /><br />
	<button class="friends-button">Click Me</button>
</form>
```


```javascript
var selectorArrayHelper = $('.selector-array-form').FormHelper({
	fields: {
		friends: {
			selector: '.friend',
			validate: [FormHelper.validations.notEmpty()]
		}
	}
});

$('.selector-array-form .friends-button').click(function(e) {
	e.preventDefault();
	
	if (!selectorArrayHelper.validate()) {
		// Validation will fail if any of the friends are empty.
		return;
	}

	var state = selectorArrayHelper.currentState();
	
	// state now contains a JSON representation of the form data:
	// {
	// 	friends: [
	// 		'Jane',
	// 		'Jake',
	// 		'Sally'
	// 	]
	// }
});
```

## Building Custom State

Sometimes your data won't always be in a form field. Element attributes, text, or even HTML might hold critical parts of your data that need to be included when constructing form state.  FormHelper supports this too.

```html
<div class="custom-state">
	<span class="title">This is my title</span>
	
	<div class="notes">
		<span data-id="1">Note 1</span><br />
		<span data-id="2">Note 2</span>
	</div>

	<button>Test</button>
</div>
```

```javascript
var customStateHelper = $('.custom-state').FormHelper({
	fields: {
		title: {
			selector: '.title',
			state: function($elem) {
				return $elem.text();
			},
			validate: [FormHelper.validations.minLength(5)]
		},
		notes: {
			selector: '.notes',
			state: function($elem) {
				return $elem.children('span').map(function() {
					var $this = $(this);
					
					return {
						id: $this.attr('data-id'),
						note: $this.text()
					};
				}).get();
			}
		}
	}
});

$('.custom-state button').click(function(e) {
	e.preventDefault();
	
	if (!customStateHelper.validate()) {
		// Validation is run against every data item returned from the state function.
		// If the state function returns an array, validation is run against each item in the array.
		return;
	}

	var state = customStateHelper.currentState();
	
	// state now contains a JSON representation of the form data:
	// {
	// 	title: 'This is my title',
	// 	notes: [
	// 		{
	// 			id: '1',
	// 			note: 'Note 1'
	// 		},
	// 		{
	// 			id: '2',
	// 			note: 'Note 2'
	// 		}
	// 	]
	// }
});
```

## The Holy Grail: Nested State

Let's face it:  Your state objects will sometimes have nested data, and it will often times make your configuration more readable if you aren't using `state` everywhere to build these nested data sets.  FormHelper can handle this with ease.

```html
<div class="nested-state">
	<span class="title">This is my title</span>
	
	<div class="note">
		<span data-id="1">Note 1</span><br />
		<input type="text" value="Here is my first note" />
	</div>

	<div class="note">
		<span data-id="2">Note 2</span>
		<input type="text" value="Here is my second note" />
	</div>

	<button>Test</button>
</div>
```

```javascript
var nestedStateHelper = $('.nested-state').FormHelper({
	fields: {
		title: {
			selector: '.title',
			state: function($elem) {
				return $elem.text();
			},
			validate: [FormHelper.validations.minLength(5)]
		},
		notes: {
			selector: '.note',
			fields: {
				id: {
					selector: 'span',
					state: function($elem) {
						return $elem.attr('data-id');
					}
				},
				name: {
					selector: 'span',
					state: function($elem) {
						return $elem.text();
					}
				},
				content: {
					selector: 'input',
					validate: [FormHelper.validations.notEmpty()]
				},
			}
		}
	}
});

$('.nested-state button').click(function(e) {
	e.preventDefault();
	
	if (!customStateHelper.validate()) {
		return;
	}

	var state = customStateHelper.currentState();
	
	// state now contains a JSON representation of the form data:
	// {
	// 	title: 'This is my title',
	// 	notes: [
	// 		{
	// 			id: '1',
	// 			name: 'Note 1',
	// 			content: 'This is my first note'
	// 		},
	// 		{
	// 			id: '2',
	// 			name: 'Note 2',
	// 			content: 'This is my second note'
	// 		}
	// 	]
	// }
});
```

You can nest fields as deeply as you desire.  FormHelper will continue to walk through your field tree and build your state appropriately.

## Built-In Validations

### `notEmpty()`

Passes if the value is not an empty string.

### `isAlpha()`

Passes if the value contains only alpha characters.

### `isNumeric()`

Passes if the value contains only numeric characters.

### `isAlphaNumeric()`

Passes if the value contains only alpha and numeric characters.

### `hasLength(length)`

Passes if the value has the specified length.

### `minLength(length)`

Passes if the value has at least the specified length.

### `maxLength(length)`

Passes if the value has at most the specified length.