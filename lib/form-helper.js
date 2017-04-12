'use strict';

(function($, window) {
	var _private = {
		fieldValue: function($field, fieldSettings, ignored, explicitState) {
			if (fieldSettings.state) return fieldSettings.state($field);
			if (fieldSettings.fields) return _private.currentState($field, fieldSettings.fields, ignored, explicitState);
			
			var value = $field.val();

			// Checkboxes are weird.
			// If a checkbox has a set value, we will ignore it if it is not checked.
			// If it does not have a set value, we will use true/false.
			var isCheckbox = $field.is('input[type="checkbox"]');
			var isChecked = (isCheckbox ? $field.is(':checked') : false);
			if (isCheckbox && !isChecked && value !== 'on') return undefined;
			if (isCheckbox && value === 'on') value = isChecked;

			return value;
		},
		validate: function($parent, fields, ignored, explicitState) {
			var pass = true;

			$.each(fields, function(name, fieldSettings) {
				var $fields = $("[name='" + name + "']", $parent);
				if (fieldSettings.selector) $fields = $(fieldSettings.selector, $parent);

				$fields.each(function() {
					var $field = $(this);
					var fieldPass = true;
					var states = _private.fieldValue($field, fieldSettings, ignored, explicitState);
					if (states === undefined) return true;
					if (!Array.isArray(states)) states = [states];

					$.each(fieldSettings.validate, function(i, validation) {
						$.each(states, function(i, state) {
							fieldPass = validation(state);
							if (!fieldPass) return false;
						});
					});

					if (fieldPass) {
						fieldSettings.onPass.apply($field);
					} else {
						fieldSettings.onFail.apply($field);
					}

					pass = (pass && fieldPass);

					if (fieldSettings.fields) {
						pass = (pass && _private.validate($field, fieldSettings.fields));
					}
				});
			});

			return pass;
		},
		currentState: function($parent, fields, ignored, explicitState) {
			function isIgnored($field) {
				for (var i = 0; i < ignored.length; i++) {
					if (typeof ignored[i] === 'string' && $field.attr('name') === ignored[i]) return true;
					if(ignored[i].selector && $field.is(ignored[i].selector)) return true;
				}

				return false;
			}

			var state = {};
			
			// Build state in standard way first.
			$parent.find('input, select, textarea').each(function() {
				var $field = $(this);
				var name = $field.attr('name');

				if (!name ||
						isIgnored($field) ||
						(explicitState && !fields[name])) {
					return true;
				}

				var last2Chars = name.substr(name.length - 2);
				if (last2Chars !== '[]' && $('[name="' + name + '"]', $parent).length > 1) return true;

				var value = _private.fieldValue($field, {}, ignored, explicitState);
				if (value === undefined) return true;

				if (last2Chars === '[]') {
					name = name.substr(0, name.length - 2);
					if (!state[name]) state[name] = [];
					state[name].push(value);
				} else {
					state[name] = value;
				}
			});

			// Iterate over fields to get custom state.
			// This takes precedence over standard config, so it happens last.
			$.each(fields, function(name, fieldSettings) {
				if (!fieldSettings.selector) return true;

				var $fields = $(fieldSettings.selector, $parent);
				if ($fields.length === 0) return true;

				if ($fields.length === 1) {
					var value = _private.fieldValue($fields, fieldSettings, ignored, explicitState);
					if (value === undefined) return true;
					state[name] = value;
				} else {
					state[name] = [];

					$fields.each(function() {
						var value = _private.fieldValue($(this), fieldSettings, ignored, explicitState);
						if (value === undefined) return true;
						state[name].push(value);
					});
				}
			});

			return state;
		}
	};

	var _validations = {
		// `notEmpty` returns true if the value is not equal to an empty string.
		notEmpty: function() {
			return function(val) {
				return (val != '');
			};
		},
		// `isAlpha` returns true if the value contains only upper and lowercase letters.
		isAlpha: function() {
			return function(val) {
				var i, len, code;

				for (i = 0, len = str.length; i < len; i++) {
					code = str.charCodeAt(i);
					
					if (!(code > 64 && code < 91) && // upper alpha (A-Z)
							!(code > 96 && code < 123)) { // lower alpha (a-z)
						return false;
					}
				}
				
				return true;
			};
		},
		// `isNumeric` returns true if the value contains only numbers.
		isNumeric: function() {
			return function(val) {
				return $.isNumeric(val);
			};
		},
		// `isAlphaNumeric` returns true if the value contains only upper and lowercase letters and numbers.
		isAlphaNumeric: function() {
			return function(val) {
				var i, len, code;

				for (i = 0, len = str.length; i < len; i++) {
					code = str.charCodeAt(i);
					
					if (!(code > 47 && code < 58) && // numeric (0-9)
							!(code > 64 && code < 91) && // upper alpha (A-Z)
							!(code > 96 && code < 123)) { // lower alpha (a-z)
						return false;
					}
				}
				
				return true;
			};
		},
		// `hasLength` returns true if the value is the specified length.
		hasLength: function(length) {
			return function(val) {
				return (val && val.length === length);
			};
		},
		// `minLength` returns true if the value is at least the specified length.
		minLength: function(length) {
			return function(val) {
				return (val && val.length >= length);
			};
		},
		// `maxLength` returns true if the value is at most the specified length.
		maxLength: function(length) {
			return function(val) {
				return (val && val.length <= length);
			}
		}
	};

	var _init = function($form, settings) {
		// Fill in default settings if not provided.
		if (settings === undefined) settings = {};
		if (!settings.validations) settings.validations = [];

		var validations = {
			notEmpty: _validations.notEmpty,
			isAlpha: _validations.isAlpha,
			isAlphaNumeric: _validations.isAlphaNumeric,
			isNumeric: _validations.isNumeric,
			minLength: _validations.minLength,
			maxLength: _validations.maxLength
		};

		$.extend(validations, settings.validations);

		if (!settings.onFail) {
			settings.onFail = function() {
				if (this.parent().is('fieldset')) {
					this.parent().addClass('error');
				} else {
					this.addClass('error');
				}
			};
		}

		if (!settings.onPass) {
			settings.onPass = function() {
				if (this.parent().is('fieldset')) {
					this.parent().removeClass('error');
				} else {
					this.removeClass('error');
				}
			};
		}

		if (settings.fields === undefined) settings.fields = {};

		function fillFieldDefaults(fields, parent) {
			$.each(fields, function(name, fieldSettings) {
				fieldSettings.name = name;

				if (parent !== undefined) {
					fieldSettings.parent = parent;
				}

				if (!fieldSettings.validate) {
					fieldSettings.validate = [];
				}

				if (!fieldSettings.onFail) {
					fieldSettings.onFail = settings.onFail;
				}

				if (!fieldSettings.onPass) {
					fieldSettings.onPass = settings.onPass;
				}

				if (fieldSettings.fields) {
					fillFieldDefaults(fieldSettings.fields, fieldSettings);
				}
			});
		}

		fillFieldDefaults(settings.fields);
		
		function validate(field) {
			var $parent = $form;
			var fields = settings.fields;

			if (field !== undefined) {
				// TODO: What if multiple elements are returned?
				function getElement(field) {
					var $parent = (field.parent ? getElement(field.parent) : $form);
					if (field.selector) return $(field.selector, $parent);
					return $('[name="' + field.name + '"]', $parent);
				}

				$parent = (field.parent ? getElement(field.parent) : $form);
				fields = {};
				fields[field.name] = field;
			}

			return _private.validate($parent, fields, settings.ignored, settings.explicitState);
		}

		var publicFields = {};

		function buildPublicFields(fields, currentPublicFields) {
			$.each(fields, function(name, fieldSettings) {
				currentPublicFields[name] = {
					validate: function() {
						return validate(fieldSettings);
					}
				};

				if (fieldSettings.fields) {
					buildPublicFields(fieldSettings.fields, currentPublicFields[name]);
				}
			});
		}

		buildPublicFields(settings.fields, publicFields);

		if (settings.ignored === undefined) settings.ignored = [];
		if (settings.explicitState === undefined) settings.explicitState = false;

		return {
			fields: publicFields,
			validate: function() {
				return _private.validate($form, settings.fields, settings.ignored, settings.explicitState);
			},
			currentState: function() {
				return _private.currentState($form, settings.fields, settings.ignored, settings.explicitState);
			}
		};
	};

	// Add FormHelper as a jQuery plugin.
	$.fn.extend({
		FormHelper: function(settings) {
			return _init($(this), settings);
		}
	});

	// Add FormHelper to the window object for direct access.
	window.FormHelper = {
		init: _init,
		validations: _validations
	};
})(jQuery, window);