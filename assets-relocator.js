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
		  tempFolder: path.join(os.tmpdir(), 'idml-temp-storage')
		};
		this.setOptions(options);
		this.run();
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
		options = Object.assign({}, options, this.defaultOptions);
		this.tempFolder = options.tempFolder;
		this.source = options.source;
		this.toRemove = new RegExp(options.strToRemove, 'gi');
		this.replacement = options.strReplacement;
		this.newFilePath = this.makeNewFileName(options.source);
	}

	makeNewFileName(fileName) {
		return fileName.substr(0, fileName.lastIndexOf('.')) + '_fixed' + fileName.substr(fileName.lastIndexOf('.'));
	}

	run() {
		unzip(this.source, this.tempFolder)
			.then(this.unzipDone.bind(this))
			.then(this.saveNewIdml.bind(this));
	}

	unzipDone(files) {
		return files
			.filter(this.filterItems.bind(this))
			.forEach(this.handleFile.bind(this));
	}

	filterItems(item) {
		return item.type === 'file';
	}

	handleFile(file) {
		let str = file.data.toString('utf-8');
		if (this.toRemove.test(str)) {
			console.log('Cleaning file \"' + file.path + '\" now!'); // TODO: remove console.log, use events that consumers can listen for
			str = str.replace(this.toRemove, this.replacement);
			fs.writeFileSync(path.join(this.tempFolder, file.path), str);
		}
	}

	saveNewIdml(files) {
		zipdir(this.tempFolder, { saveTo: this.newFilePath }, () => {
			rimraf(this.tempFolder, (err, result) => {
				// Done cleaning
			});
		});
	}
}

module.exports = AssetsRelocator;