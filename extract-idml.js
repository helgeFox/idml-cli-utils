'use strict';

const path = require('path');
const decompress = require('decompress');

const environments = {
	stage: '\\\\fot-s-web01.prodno.osl.basefarm.net\\DATA2\\',
	prod: '\\\\svfsfox01\\DATA1\\'
};
const templatesPath = 'IDS\\TEMPLATES\\';
const instancesPath = 'IDS\\INSTANCES\\';

let envPath = environments['stage'];
let basePath = envPath + templatesPath;

function combinePaths(commonPath, idmlName, resultDirname) {
	const toExtract = path.join(basePath, commonPath, appendExt(idmlName, 'idml'));
	const targetPath = path.join(basePath, commonPath, resultDirname ? resultDirname : idmlName);
	return {
		source: toExtract,
		target: targetPath
	};
}

function appendExt(p, ext) {
	return p.indexOf('.' + ext) > 0 ? p : p + '.' + ext;
}

module.exports = {
	extract: function (options) {
		return new Promise((resolve, reject) => {
			if (options.prod) envPath = environments['prod'];
			if (options.instance) basePath = envPath + instancesPath;
			if (options.basePath) basePath = options.basePath;
			if (!options.idmlName) throw 'Missing required argument \'idmlName\'';
			const paths = combinePaths(options.commonPath ? options.commonPath : '', options.idmlName, options.resultDirname);
			decompress(paths.source, paths.target)
				.then(() => {
					resolve(paths.target);
				}).catch(reject);
		});
	}
}