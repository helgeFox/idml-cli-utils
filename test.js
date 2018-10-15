'use strict';

// const chalk = require('chalk');
// const utils = require('.');

const spinners = require('./spinners.json');

const ora = require('ora');

const spinner = ora({text: 'Testing testing', spinner: {
	"interval": 125,
	"frames": [
		"∙∙∙",
		"●∙∙",
		"∙●∙",
		"∙∙●",
		"∙∙∙"
	]
}
}).start();