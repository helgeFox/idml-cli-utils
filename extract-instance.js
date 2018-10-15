'use strict';

const meow = require('meow');

const cli = meow(`
	Usage
	  $ extract-instance <guid>

	Options
	  --prod, -p  Execute in production environment

	Examples
	  $ extract-instance 21bd1d64-5dce-47e3-babd-01eff8ab77cc --prod
`, {
	flags: {
		prod: {
			type: 'boolean',
			alias: 'p'
		}
	}
});

const extractor = require('./extract-idml');

const file = cli.input[0];
const prod = cli.flags.prod;

extractor.extract({
	commonPath: file,
	idmlName: file,
	resultDirname: 'extracted',
	prod: prod,
	instance: true
}).then(() => {
	console.log('done!');
});