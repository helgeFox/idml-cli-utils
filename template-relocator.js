'use strict';

const os = require('os');
const fs = require('graceful-fs');
const path = require('path');
const cpy = require('cpy');
const shortid = require('shortid');
const rimraf = require('rimraf');

class TemplateRelocator {
	constructor(prodPath, stagePath) {
		if (!prodPath || prodPath.length < 1)
			throw new Error('No prodPath supplied!');
		if (!stagePath || stagePath.length < 1)
			throw new Error('No stagePath supplied!');
		this.prodTemplatePath = this._buildProdPath(prodPath);
		this.stageTemplatePath = this._buildStagePath(stagePath);
	}

	_buildProdPath(templatePath) {
		this.idmlName = templatePath.substr(templatePath.lastIndexOf('/') + 1);
		templatePath = templatePath.substr(0, templatePath.lastIndexOf('/'));
		let prodPath = path.join('//svfsfox01', 'DATA1', 'IDS', 'TEMPLATES');
		return path.join(prodPath, templatePath);
	}

	_buildStagePath(templatePath) {
		let stagePath = path.join('//fot-s-web01.prodno.osl.basefarm.net', 'DATA2', 'IDS', 'TEMPLATES');
		return path.join(stagePath, templatePath);
	}

	checkProd() {
		return this._check(this.prodTemplatePath);
	}

	checkStage() {
		return this._check(this.stageTemplatePath);
	}

	_check(uri) {
		return new Promise((resolve, reject) => {
			fs.access(uri, (err, result) => {
				if (err) {
					let env = uri.indexOf('basefarm') >= 0 ? 'STAGE' : 'PROD';
					return reject(new Error(`${env} path is not available (${uri})`));
				}
				else return resolve(result);
			});
		});
	}

	copyToLocal() {
		let temporaryId = shortid.generate();
		this.tempDir = path.join(os.tmpdir(), 'idml-utils-storage', 'tr-temp', temporaryId);
		return this._copy(this.prodTemplatePath, this.tempDir);
	}

	copyToStage() {
		return this._copy(this.tempDir, this.stageTemplatePath).then(() => {
			rimraf(this.tempDir, (err, result) => {
				// Done cleaning
			});
		});
	}

	_copy(from, to) {
		let options = {
			cwd: from,
			parents: true,
			nodir: true
		};
		return cpy(['**/*'], to, options);
	}

	getStageIdmlUri() {
		return path.join(this.stageTemplatePath, this.idmlName + '.idml');
	}
}

module.exports = TemplateRelocator;