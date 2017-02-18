# Form Helper

This jQuery plugin helps with form validation and serialization.

## Minimal Example

The following example shows how to quickly set up and validate a login form.

Our validations require that both the email and password form fields are at least 4 characters in length.

```html
	<form class="login-form">
		<input name="email" type="text" /><br />
		<input name="password" type="password" /><br />
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
			<input name="email" type="text" />
		</div>

		<div class="field-wrapper">
			<label>Enter your password</label>
			<input name="password1" type="password" />
		</div>

		<div class="field-wrapper">
			<label>Confirm your password</label>
			<input name="password2" type="password" />
		</div>
		
		<a class="signup-button" href="#">Create Account</a>
	</form>
```

```javascript
var signupFormHelper = $('.login-form').FormHelper({
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