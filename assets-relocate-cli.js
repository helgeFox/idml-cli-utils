#! /usr/bin/env node
'use strict';

const meow = require('meow');
const chalk = require('chalk');
const AssetsRelocator = require('.').AssetsRelocator;

const cli = meow(`
  Usage
    $ assets-relocate <source> <strToRemove> <strReplacement>

  Examples
    $ assets-relocate "D:\\TEMP\\idml-to-fix.idml" DATA1/IDS/TEMPLATES/863 DATA2/IDS/TEMPLATES/705
    DONE!
`);

if (!cli.input || cli.input.length < 3) {
	console.log(chalk.red('Missing arguments!'));
}
else {
	var ar = new AssetsRelocator({
		source: cli.input[0],
		strToRemove: cli.input[1],
		strReplacement: cli.input[2]
	});
	ar.fixIdml();
	ar.fixRules();
}