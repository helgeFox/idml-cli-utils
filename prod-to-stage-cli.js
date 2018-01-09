#! /usr/bin/env node
'use strict';


const meow = require('meow');
const fs = require('graceful-fs');
const chalk = require('chalk');
const boxen = require('boxen');

const idmlUtils = require('.');
const TemplateRelocator = idmlUtils.TemplateRelocator;
const AssetsRelocator = idmlUtils.AssetsRelocator;

const cli = meow(`
  Usage
    $ template-relocate <prodPath> <stagePath>

  Examples
    $ template-relocate 122/DM/PM_Test_Helge/PM_DM_liten_Uadressert_Solgt helge/testing
    Success!
`);

if (!cli.input || cli.input.length < 2) {
	console.log(chalk.red('Missing arguments!'));
}
else {
	const prod = cli.input[0];
	const stage = cli.input[1];

	runTemplateRelocator(prod, stage)
		.then(runAssetsReplacer.bind(null, prod, stage))
		.then(renameIdmlAndRules.bind(null));
}

function runTemplateRelocator(prod, stage) {
	return new Promise((resolve, reject) => {
		const tr = new TemplateRelocator(prod, stage);

		console.log(`\nChecking PROD availability...`);
		tr.checkProd()
			.then(() => {
				let str = `\nCopying from PROD...`;
				console.log(str);
				return tr.copyToLocal().then(() => console.log(`${chalk.green('Copy OK')}`));
			})
			.then(() => {
				let str = `\nTemplate copied to local temporary folder. Please hook up the ${chalk.yellow('STAGE VPN')} now!\nPress the "ANY" key when ${chalk.yellow('STAGE')} is ready...`;
				console.log(str);
				return new Promise((resolve, reject) => {
					waitForKeyPress(resolve);
				});
			})
			.then(() => {
				console.log(`\nChecking STAGE availability...`);
				return tr.checkStage();
			})
			.then(() => {
				let str = `\nCopying to STAGE...`;
				console.log(str);
				return tr.copyToStage().then(() => console.log(`${chalk.green('Copy OK')}`));
			})
			.then(() => {
				let str = `${chalk.green('Success!')}`;
				let formatted = boxen(str, {padding: 1, margin: 1});
				console.log(formatted);
				resolve(tr.getStageIdmlUri());
			})
			.catch((err) => {
				let str = `\n\n${chalk.red(err)}\n`;
				console.log(str);
			});
	});
}

function runAssetsReplacer(prod, stage, idmlStageUri) {
	return new Promise((resolve, reject) => {
		var ar = new AssetsRelocator({
			source: idmlStageUri,
			strToRemove: prod.substr(0, prod.lastIndexOf('/')),
			strReplacement: stage
		});
		ar.fixIdml()
			.then(ar.fixRules.bind(ar))
			.then(resolve.bind(null, idmlStageUri));
	});
}

function renameIdmlAndRules(idmlStageUri) {
	let idml = idmlStageUri;
	let rules = idmlStageUri.replace('.idml', '.rules');
	let oldIdml = idml.replace('.idml', '_OLD.idml');
	let oldRules = rules.replace('.rules', '_OLD.rules');
	let newIdml = idmlStageUri.replace('.idml', '_fixed.idml');
	let newRules = idmlStageUri.replace('.idml', '_fixed.rules');
	fs.renameSync(idml, oldIdml);
	fs.renameSync(rules, oldRules);
	fs.renameSync(newIdml, idml);
	fs.renameSync(newRules, rules);
}

function waitForKeyPress(callback) {
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.once('data', () => {
		process.stdin.pause();
		callback();
	});
}