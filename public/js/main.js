requirejs.config({
	paths: {
		postmonger: 'postmonger'
	},
	shim: {
		'jquery': {
			exports: '$'
		},
		'custom_activity': {
			deps: ['jquery', 'postmonger']
		}
	}
});

requirejs(['jquery', 'custom_activity'], function ($, customEvent) {
    // Require loaded
});

requirejs.onError = function (err) {
	if (err.requireType === 'timeout') {
		console.log('modules: ' + err.requireModules);
	}
	throw err;
};