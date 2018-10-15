#! /usr/bin/env node
'use strict';


const meow = require('meow');
const fs = require('graceful-fs');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');

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
		.then(renameIdmlAndRules.bind(null))
		.then(() => {
			let str = `${chalk.green('Success!')}`;
			let formatted = boxen(str, {padding: 1, margin: 1});
			console.log(formatted);
		})
		.catch(() => {
			let str = `${chalk.red('Error!')}`;
			let formatted = boxen(str, {padding: 1, margin: 1});
			console.log(formatted);
		});
}

function runTemplateRelocator(prod, stage) {
	return new Promise((resolve, reject) => {
		const tr = new TemplateRelocator(prod, stage);

		console.log('');
		let spinner = ora({text: 'Checking PROD availability...', color: 'yellow'}).start();

		tr.checkProd()
			.then(() => {
				spinner.text = 'Copying from PROD...';
				spinner.color = 'green';
				return tr.copyToLocal().then(() => spinner.succeed('Copied from PROD!'));
			})
			.then(() => {
				let str = `\nTemplate copied to local temporary folder. Please hook up the ${chalk.yellow('STAGE VPN')} now!\nPress the "ANY" key when ${chalk.yellow('STAGE')} is ready...`;
				console.log(str);
				return new Promise((resolve, reject) => {
					waitForKeyPress(resolve);
				});
			})
			.then(() => {
				console.log('');
				spinner = ora({text: 'Checking STAGE availability...', color: 'yellow'}).start();
				return tr.checkStage();
			})
			.then(() => {
				spinner.text = 'Copying to STAGE...';
				spinner.color = 'green';
				return tr.copyToStage().then(() => spinner.succeed('Copied to STAGE!'));
			})
			.then(() => {
				resolve(tr.getStageIdmlUri());
			})
			.catch((err) => {
				spinner.fail();
				let str = `\n\n${chalk.red(err)}\n`;
				console.log(str);
			});
	});
}

function runAssetsReplacer(prod, stage, idmlStageUri) {
	return new Promise((resolve, reject) => {
		console.log('');
		var spinner = ora({text: 'Fixing assets references...', color: 'yellow'}).start();
		var ar = new AssetsRelocator({
			source: idmlStageUri,
			strToRemove: prod.substr(0, prod.lastIndexOf('/')),
			strReplacement: stage
		});
		ar.fixIdml()
			.then(ar.fixRules.bind(ar))
			.then(() => {
				spinner.succeed('Fixed assets references!');
				resolve(idmlStageUri);
			})
			// .then(resolve.bind(null, idmlStageUri))
			.catch(spinner.fail.bind(spinner));
	});
}

function renameIdmlAndRules(idmlStageUri) {
	console.log('');
	let spinner = ora({text: 'Renaming files as a safety precaution...', color: 'yellow'}); // TODO this is not showing up, don't know exactly why...  (Edit: maybe inside the Promise is better?)
	return new Promise((resolve, reject) => {
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
		spinner.succeed('Renamed files!');
		resolve();
	});
}

function waitForKeyPress(callback) {
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.once('data', () => {
		process.stdin.pause();
		callback();
	});
}