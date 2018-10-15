#! /usr/bin/env node
'use strict';

const meow = require('meow');
// const fs = require('graceful-fs');
const chalk = require('chalk');

const exec = require('child_process').exec;

const cli = meow(`
  Usage
    $ instance <guid> [options]

  Examples
    $ instance 1e5c6721-1bb0-4103-8863-c13335410cfe --prod
    Success!
`);

if (!cli.input || cli.input.length < 1) {
	console.log(chalk.red('Missing arguments!'));
}
else {
	const guid = cli.input[0];
	const useProd = cli.input[1];
	const prodURI = '\\\\svfsfox01\\DATA1';
	const stageURI = '\\\\fot-s-web01.prodno.osl.basefarm.net\\DATA2\\';
	let folder;

	folder = `${useProd ? prodURI : stageURI}\\IDS\\INSTANCES\\${guid}`;

	console.log(chalk.green(`Opening STAGE instance folder for '${guid}'`));
	exec(`start ${folder}`);
}