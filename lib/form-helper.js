'use strict';

(function($, window) {
	var _validations = {
		notEmpty: function() {
			return function(val) {
				return (val != '');
			};
		},
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
		isNumeric: function() {
			return function(val) {
				return $.isNumeric(val);
			};
		},
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
		hasLength: function(length) {
			return function(val) {
				return (val && val.length === length);
			};
		},
		minLength: function(length) {
			return function(val) {
				return (val && val.length >= length);
			};
		},
		maxLength: function(length) {
			return function(val) {
				return (val && val.length <= length);
			}
		}
	};

	var _init = function($form, settings) {
		if (settings === undefined) {
			settings = {};
		}

		if (!settings.validations) {
			settings.validations = [];
		}

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

		if (settings.fields === undefined) {
			settings.fields = {};
		}

		$.each(settings.fields, function(name, fieldSettings) {
			if (!fieldSettings.validate) {
				fieldSettings.validate = [];
			}

			if (!fieldSettings.onFail) {
				fieldSettings.onFail = settings.onFail;
			}

			if (!fieldSettings.onPass) {
				fieldSettings.onPass = settings.onPass;
			}
		});

		return {
			validate: function() {
				var pass = true;

				$form.find('input, select, textarea').each(function() {
					var $field = $(this);
					var fieldSettings = settings.fields[$field.attr('name')];

					if (fieldSettings) {
						var fieldPass = true;

						$.each(fieldSettings.validate, function(i, validation) {
							fieldPass = fieldPass && validation($field.val());

							if (!fieldPass) {
								return false;
							}
						});

						if (fieldPass) {
							fieldSettings.onPass.apply($field);
						} else {
							fieldSettings.onFail.apply($field);
						}

						pass = pass && fieldPass;
					}
				});

				return pass;
			},
			currentState: function() {
				var state = {};
				
				$form.find('input, select, textarea').each(function() {
					var $field = $(this);
					var name = $field.attr('name');

					if (!name) {
						return true;
					}

					if (name && name.substr(name.length - 2) === '[]') {
						state[name] = [];
						state[name].append($field.val());
					} else {
						state[name] = $field.val();
					}
				});

				return state;
			}
		};
	};

	$.fn.extend({
		FormHelper: function(settings) {
			return _init($(this), settings);
		}
	});

	window.FormHelper = {
		init: _init,
		validations: _validations
	};
})(jQuery, window);