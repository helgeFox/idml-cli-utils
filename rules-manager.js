const fs 	= require('fs');
const cpy 	= require('cpy');
const _ 	= require('lodash');
const leftPad = require('leftpad');

function getContents(filePath) {
	return new Promise(function (resolve, reject) {
		fs.readFile(filePath, function(err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
}

function parseRawRules(type, fileContents) {
	if (type)
		return _.filter(JSON.parse(fileContents), {Name: type});
	return JSON.parse(fileContents);
}

function stripRuleTypes(options, rules) {
	let fixed = _.reduce(rules, (result, rule) => {
		if (rule.Name !== options.ruleType)
			result.push(rule);
		else if (options.targetId) {
			if (rule.Values.targetId !== options.targetId)
				result.push(rule);
		}
		return result;
	}, []);
	return fixed;
}

function saveNewRulesFile(filePath, fixedRules) {
	fs.rename(filePath, createNewBackupFilename(filePath), (err, result) => {
		if (err) return;
		fs.writeFile(filePath, JSON.stringify(fixedRules));
	});
	return fixedRules;
}

function createNewBackupFilename(filePath) {
	let obj = getTimeObject();
	let id = `${obj.y}${obj.m}${obj.d}${obj.h}${obj.min}${obj.sec}`;
	return filePath.replace('.rules', `-BCK-${id}.rules`);
}

function getTimeObject() {
	var pad = function(num) {
		return leftPad(num, 2, '0');
	};
	var d = new Date();
	return {
		y: d.getFullYear(),
		m: pad(d.getMonth() + 1),
		d: pad(d.getDate()),
		h: pad(d.getHours()),
		min: pad(d.getMinutes()),
		sec: pad(d.getSeconds())
	};
}

function onError(err) {
	console.log(err.message);
}

module.exports = {
	getRules: function (filePath, ruleType) {
		return getContents(filePath)
			.then(parseRawRules.bind(null, ruleType))
			.catch(onError);
	},

	purgeRuleType: function (filePath, ruleType, targetId) {
		let stripOptions = {ruleType: ruleType};
		if (targetId)
			stripOptions.targetId = targetId;
		return getContents(filePath)
			.then(parseRawRules.bind(null, null))
			.then(stripRuleTypes.bind(null, stripOptions))
			.then(saveNewRulesFile.bind(null, filePath))
			.catch(onError);
	},

	purgeTargetedRules: function (filePath, ruleType, targetId) {
		return getContents(filePath)
			.then(parseRawRules.bind(null, null))
			.then(stripRuleTypes.bind(null, {ruleType: ruleType, targetId: targetId}))
			.then(saveNewRulesFile.bind(null, filePath))
			.catch(onError);
	}
};