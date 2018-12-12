'use strict';

const meow = require('meow');
const chalk = require('chalk');

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