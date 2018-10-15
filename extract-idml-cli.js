#! /usr/bin/env node

var path = require('path');
var decompress = require('decompress');

var file = process.argv[2];

if (file) {
	// const toExtract = path.join(basePath, pathToIdml, appendExt(idmlName));
	// const targetPath = path.join(basePath, pathToIdml, 'IDML');
	// decompress(file, targetPath).then(files => {
		console.log('done!', file);
	// });

	// function appendExt(p) {
	// 	return p.indexOf('.idml') > 0 ? p : p + '.idml';
	// }
}