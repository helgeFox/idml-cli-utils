'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const unzip = require('decompress');
const zipdir = require('zip-dir');
const rimraf = require('rimraf');

class AssetsRelocator {
	constructor(options) {
		this.defaultOptions = {
			tempFolder: path.join(os.tmpdir(), 'idml-utils-storage', 'ar-temp')
		};
		this.setOptions(options);
	}

	setOptions(options) {
		if (!options.source || options.source.length < 1) {
			throw new Error('No <source> file supplied');
		}
		if (!options.strToRemove || options.strToRemove.length < 1) {
			throw new Error('No <strToRemove> supplied');
		}
		if (!options.strReplacement || options.strReplacement.length < 1) {
			throw new Error('No <strReplacement> supplied');
		}
		options = Object.assign({}, this.defaultOptions, options);
		this.tempFolder = options.tempFolder;
		this.source = options.source;
		this.toRemove = new RegExp(options.strToRemove, 'gi');
		this.replacement = options.strReplacement;
		this.newFilePath = this.makeNewFileName(options.source);
	}

	makeNewFileName(fileName) {
		return fileName.substr(0, fileName.lastIndexOf('.')) + '_fixed' + fileName.substr(fileName.lastIndexOf('.'));
	}

	fixIdml() {
		return unzip(this.source, this.tempFolder)
			.then(this.unzipDone.bind(this))
			.then(this.saveNewIdml.bind(this));
	}

	fixRules() {
		return new Promise((resolve, reject) => {
			let rulesFilename = this.source.replace('.idml', '.rules');
			let data = fs.readFileSync(rulesFilename);
			let file = this.replaceStrings(this.toRemove, this.replacement, this.parseBuffer({data: data}));
			file = this.replaceStrings(/svfsfox01/gi, 'fot-s-web01.prodno.osl.basefarm.net', file);
			file = this.replaceStrings(/DATA1/g, 'DATA2', file);
			file = this.replaceStrings(/html5.foxpublish.net/gi, 'html5.stage.foxpublish.net', file);
			this.saveNewRules(file, rulesFilename);
			resolve();
		});
	}

	unzipDone(files) {
		return files
			.filter(this.isFile.bind(this))
			.map(this.parseBuffer.bind(this))
			.map(this.replaceStrings.bind(this, this.toRemove, this.replacement))
			.map(this.replaceStrings.bind(this, /html5.foxpublish.net/gi, 'html5.stage.foxpublish.net'))
			.map(this.replaceStrings.bind(this, /DATA1/g, 'DATA2'))
			.forEach(this.saveToTemp.bind(this));
	}

	isFile(item) {
		return item.type === 'file';
	}

	parseBuffer(file) {
		file.contents = file.data.toString('utf-8');
		return file;
	}

	replaceStrings(toRemove, replacement, file) {
		if (toRemove.test(file.contents)) {
			file.contents = file.contents.replace(toRemove, replacement);
		}
		return file;
	}

	saveToTemp(file) {
		fs.writeFileSync(path.join(this.tempFolder, file.path), file.contents);
	}

	saveNewIdml(files) {
		return new Promise((resolve, reject) => {
			zipdir(this.tempFolder, { saveTo: this.newFilePath }, () => {
				resolve();
				rimraf(this.tempFolder, (err, result) => {
					// Done cleaning
				});
			});
		});
	}

	saveNewRules(file, fileName) {
		let fixedRulesFilename = this.makeNewFileName(fileName);
		fs.writeFileSync(fixedRulesFilename, file.contents);
	}
}

module.exports = AssetsRelocator;