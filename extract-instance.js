'use strict';

const meow = require('meow');
const chalk = require('chalk');

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
}).then((result) => {
	const expl = require('child_process').exec(`explorer.exe /select,${result}`);
	expl.stderr.on('data', (data) => {
		console.log(chalk.red('Something went wrong opening the folder'), data.toString());
		process.exit(1);
	});
	expl.on('exit', code => {
		console.log(chalk.green('Success!'));
		process.exit();
	});
});