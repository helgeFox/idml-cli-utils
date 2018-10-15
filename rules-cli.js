#! /usr/bin/env node
'use strict';


const meow = require('meow');
const fs = require('graceful-fs');
const chalk = require('chalk');
const boxen = require('boxen');

const rulesManager = require('./rules-manager');

const cli = meow(`
  Usage
    $ rules-fix <ruleFile> <ruleType> [options]

  Options
    --target-id, -t  Only rules with targetId

  Examples
    $ rules-fix "V:\\IDS\\TEMPLATES\\692\\Test\\Salgsoppgave\\MHE_Prospekt_K1.rules" "pdfAttachments" --target-id "u13d"
    Success!
`,
{
	flags: {
		targetId: {
			type: 'string',
			alias: 't'
		}
	}
});


function check(uri) {
	return new Promise((resolve, reject) => {
		fs.access(uri, (err, result) => {
			if (err) {
				return reject(new Error(`Rules file is not available (${uri})`));
			}
			else return resolve(result);
		});
	});
}

function log(str, options) {
	options = options || {};
	let color = options.type === 'error' ? chalk.red : chalk.green;
	str = color(`\n${str}`);
	if (options.box) str = boxen(str, {padding: 1, margin: 1});
	console.log(str);
}

if (!cli.input || cli.input.length < 1) {
	log('Missing arguments!', {type: 'error'});
}
else {
	const ruleFile = cli.input[0];
	const ruleType = cli.input[1];
	const targetId = cli.flags.targetId || cli.input[2];

	check(ruleFile)
		.then(() => {
			// we have a rulesfile to handle
			if (ruleType && ruleType.length) {
				// We also have a named ruletype to purge
				rulesManager.purgeRuleType(ruleFile, ruleType, targetId).then(result => {
					log('Done!')
					log(`Rules total after purge: ${result.length}`);
				});
			}
			else {
				rulesManager.getRules(ruleFile).then(result => {
					log(`Total rules in file: ${result.length}`, {box: true});
				});
			}
		})
		.catch(err => {
			log(`Error: could not find rules file ${ruleFile}`, {type: 'error'});
		});
}
