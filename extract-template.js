'use strict';

const meow = require('meow');

const cli = meow(`
	Usage
	  $ extract-template <templatePath> <templateName>

	Options
	  --prod, -p  Execute in production environment

	Examples
	  $ extract-template 712/Salgsoppgave/JenssenBolleSalgsoppgave JenssenBolleSalgsoppgave --prod
`, {
	flags: {
		prod: {
			type: 'boolean',
			alias: 'p'
		}
	}
});

const extractor = require('./extract-idml');

const dir = cli.input[0];
const file = cli.input[1];
const prod = cli.flags.prod;

extractor.extract({
	commonPath: dir,
	idmlName: file,
	resultDirname: file,
	prod: prod
}).then(() => {
	console.log('done!');
});