'use strict';

const fs = require('fs');
const http = require('http');
const querystring = require('querystring');

const fii = require('@foxpublish/find-idml-instance');
const boxen = require('boxen');
const ora = require('ora');
const chalk = require('chalk');

const BASE_URL = 'html5-stage.foxpublish.no';
const idmlServiceRoot = '/api/idmlservice';
const foxProxyRoot = '/api/foxproxyservice';

const templateName = '%5C%5Cfot-s-web01.prodno.osl.basefarm.net%5CDATA2%5CIDS%5CTEMPLATES%5C122%2FVindusplakat%2FVindusplakat_A3_Liggende_papir%2FVindusplakat_A3_Liggende_papir.idml';
const sessionId = 'yUNAvRFHWcJp5nAeVg0I%2BTv61jtkt%2FnQ4a2hWfCd1k%2BwkC7l3luwvk5Kh34AT3rGLzOhXcbBZYyKARCvvrwFucgGU23qcz6kfp59eczsQIxGNiNO%2BSeQBGnTY4rBuUd%2F';
const numPagesInTemplate = 1;
const scripts = {
	low: 'var+doc+%3D+app.open(new+File(%27%7B0%7D%27))%3B%0D%0A%09with(doc.documentPreferences)%7B%7B%0D%0A%09%09facingPages+%3D+false%3B%0D%0A%09%7D%7D%0D%0A++++with(app.pdfExportPreferences)%7B%7B%0D%0A++++%09pageRange+%3D+PageRange.allPages%3B%0D%0A++++%09acrobatCompatibility+%3D+AcrobatCompatibility.acrobat6%3B%0D%0A++++%09exportGuidesAndGrids+%3D+false%3B%0D%0A++++%09exportLayers+%3D+false%3B%0D%0A++++%09exportNonPrintingObjects+%3D+false%3B%0D%0A++++%09exportReaderSpreads+%3D+false%3B%0D%0A++++%09generateThumbnails+%3D+false%3B%0D%0A++++%09try%7B%7B%0D%0A++++%09%09ignoreSpreadOverrides+%3D+false%3B%0D%0A++++%09%7D%7D%0D%0A++++%09catch(e)%7B%7B%7D%7D%0D%0A++++%09includeBookmarks+%3D+true%3B%0D%0A++++%09includeHyperlinks+%3D+true%3B%0D%0A++++%09includeICCProfiles+%3D+true%3B%0D%0A++++%09includeSlugWithPDF+%3D+false%3B%0D%0A++++%09includeStructure+%3D+false%3B%0D%0A++++%09interactiveElementsOption+%3D+InteractiveElementsOptions.doNotInclude%3B%0D%0A++++%09subsetFontsBelow+%3D+0%3B%0D%0A++++%09colorBitmapCompression+%3D+BitmapCompression.jpeg%3B%0D%0A++++%09colorBitmapQuality+%3D+CompressionQuality.MEDIUM%3B%0D%0A++++%09colorBitmapSampling+%3D+Sampling.BICUBIC_DOWNSAMPLE%3B%0D%0A++++++colorBitmapSamplingDPI+%3D+72%3B%0D%0A++++%09grayscaleBitmapCompression+%3D+BitmapCompression.jpeg%3B%0D%0A++++%09grayscaleBitmapQuality+%3D+CompressionQuality.MEDIUM%3B%0D%0A++++%09grayscaleBitmapSampling+%3D+Sampling.BICUBIC_DOWNSAMPLE%3B%0D%0A++++++grayscaleBitmapSamplingDPI+%3D+72%3B%0D%0A++++%09monochromeBitmapCompression+%3D+BitmapCompression.zip%3B%0D%0A++++%09monochromeBitmapSampling+%3D+Sampling.BICUBIC_DOWNSAMPLE%3B%0D%0A++++++monochromeBitmapSamplingDPI+%3D+300%3B%0D%0A++++%09compressionType+%3D+PDFCompressionType.compressObjects%3B%0D%0A++++%09compressTextAndLineArt+%3D+true%3B%0D%0A%09%09cropImagesToFrames+%3D+true%3B%0D%0A%09%09optimizePDF+%3D+true%3B%0D%0A%09%09facingPages+%3D+false%3B%0D%0A++++++++var+docPreferences+%3D+doc.documentPreferences%3B%0D%0A++++%09bleedBottom+%3D+0%3B%0D%0A++++%09bleedTop+%3D+0%3B%0D%0A++++%09bleedInside+%3D+0%3B%0D%0A++++%09bleedOutside+%3D+0%3B%0D%0A++++++++if(bleedBottom+%26%26+bleedTop+%26%26+bleedInside+%26%26+bleedInside)%7B%7B%0D%0A++++%09%09bleedMarks+%3D+false%3B%0D%0A++++%09%7D%7D%0D%0A++++%09else%7B%7B%0D%0A++++%09%09bleedMarks+%3D+false%3B%0D%0A++++%09%7D%7D%0D%0A++++%09colorBars+%3D+false%3B%0D%0A++++%09colorTileSize+%3D+128%3B%0D%0A++++%09grayTileSize+%3D+128%3B%0D%0A++++%09cropMarks+%3D+false%3B%0D%0A++++%09omitBitmaps+%3D+false%3B%0D%0A++++%09omitEPS+%3D+false%3B%0D%0A++++%09omitPDF+%3D+false%3B%0D%0A++++%09pageInformationMarks+%3D+false%3B%0D%0A++++%09pageMarksOffset+%3D+%220+pt%22%3B%0D%0A++++%09pdfColorSpace+%3D+PDFColorSpace.unchangedColorSpace%3B%0D%0A++++%09pdfMarkType+%3D+1147563124%3B%0D%0A++++%09printerMarkWeight+%3D+PDFMarkWeight.p125pt%3B%0D%0A++++%09registrationMarks+%3D+false%3B%0D%0A++++%09try%7B%7B%0D%0A++++%09%09simulateOverprint+%3D+false%3B%0D%0A++++%09%7D%7D%0D%0A++++%09catch(e)%7B%7B%7D%7D%0D%0A++++%09useDocumentBleedWithPDF+%3Dfalse%3B%0D%0A++++%09viewPDF+%3D+false%3B%0D%0A++++%7D%7D%09%09%0D%0A%0D%0Afunction+forEach(arr%2C+func)%7B%7Bif(arr+%26%26+arr.length)%7B%7Bfor(var+i%3D0%3B+i%3Carr.length%3B+i%2B%2B)%7B%7Bfunc(arr%5Bi%5D)%3B%7D%7D+%7D%7D+%7D%7D%0D%0A%0D%0Avar+percent+%3D+0.95%3B%0D%0Avar+increment+%3D+-0.1%3B%0D%0A%0D%0Afunction+handleOverflow(document)+%7B%7B%0D%0A++++with+(document)+%7B%7B%0D%0A++++++++var+done%2C+minimum%2C+i%3B%0D%0A++++++++forEach(textFrames%2C+function(frame)+%7B%7B%0D%0A++++++++++++done+%3D+false%3B%0D%0A++++++++++++if+(isOverflowing(frame.parentStory))+%7B%7B%0D%0A++++++++++++++++minimum+%3D+frame.parentStory.horizontalScale+*+percent%3B%0D%0A++++++++++++++++done+%3D+adjustOverflowingStory(frame.parentStory%2C+%27horizontalScale%27%2C+increment%2C+minimum)%3B%0D%0A++++++++++++%7D%7D%0D%0A++++++++++++if+(!done+%26%26+isOverflowing(frame.parentStory))+%7B%7B%0D%0A++++++++++++++++minimum+%3D+frame.parentStory.pointSize+*+percent%3B%0D%0A++++++++++++++++done+%3D+adjustOverflowingStory(frame.parentStory%2C+%27pointSize%27%2C+increment%2C+minimum)%3B%0D%0A++++++++++++%7D%7D%0D%0A++++++++%7D%7D)%3B%0D%0A++++%7D%7D%0D%0A%7D%7D%0D%0A%0D%0Afunction+isOverflowing(story)+%7B%7B%0D%0A++++return+story+%26%26+story.overflows%3B%0D%0A%7D%7D%0D%0A%0D%0Afunction+adjustOverflowingStory(story%2C+property%2C+increment%2C+minimum)+%7B%7B%0D%0A++++while+(story.overflows)+%7B%7B%0D%0A++++++++story%5Bproperty%5D+%2B%3D+increment%3B%0D%0A++++++++if+(story%5Bproperty%5D+%3C%3D+minimum)%0D%0A++++++++++++return+story.overflows%3B%0D%0A++++%7D%7D%0D%0A++++return+true%3B%0D%0A%7D%7D%0D%0A%0D%0AhandleOverflow(doc)%3B%0D%0A%0D%0Adoc.exportFile(ExportFormat.pdfType%2C+new+File(%27%7B1%7D%27))%3B%0D%0Adoc.close(SaveOptions.no)%3B%0D%0A',
	hi: 'var+doc+%3D+app.open(new+File(%27%7B0%7D%27))%3B%0D%0A%09with(doc.documentPreferences)%7B%7B%0D%0A%09%09facingPages+%3D+false%3B%0D%0A%09%7D%7D%0D%0A++++with(app.pdfExportPreferences)%7B%7B++++%09%0D%0A++++%09pageRange+%3D+PageRange.allPages%3B%0D%0A++++%09acrobatCompatibility+%3D+AcrobatCompatibility.acrobat6%3B%0D%0A++++%09exportGuidesAndGrids+%3D+false%3B%0D%0A++++%09exportLayers+%3D+false%3B%0D%0A++++%09exportNonPrintingObjects+%3D+false%3B%0D%0A++++%09exportReaderSpreads+%3D+false%3B%0D%0A++++%09generateThumbnails+%3D+false%3B%0D%0A++++%09try%7B%7B%0D%0A++++%09%09ignoreSpreadOverrides+%3D+false%3B%0D%0A++++%09%7D%7D%0D%0A++++%09catch(e)%7B%7B%7D%7D%0D%0A++++%09includeBookmarks+%3D+true%3B%0D%0A++++%09includeHyperlinks+%3D+true%3B%0D%0A++++%09includeICCProfiles+%3D+true%3B%0D%0A++++%09includeSlugWithPDF+%3D+false%3B%0D%0A++++%09includeStructure+%3D+false%3B%0D%0A++++%09interactiveElementsOption+%3D+InteractiveElementsOptions.doNotInclude%3B%0D%0A++++%09subsetFontsBelow+%3D+0%3B%0D%0A++++%09colorBitmapCompression+%3D+BitmapCompression.jpeg%3B%0D%0A++++%09colorBitmapQuality+%3D+CompressionQuality.HIGH%3B%0D%0A++++%09colorBitmapSampling+%3D+Sampling.NONE%3B%0D%0A++++++%0D%0A++++%09grayscaleBitmapCompression+%3D+BitmapCompression.jpeg%3B%0D%0A++++%09grayscaleBitmapQuality+%3D+CompressionQuality.HIGH%3B%0D%0A++++%09grayscaleBitmapSampling+%3D+Sampling.NONE%3B%0D%0A++++++%0D%0A++++%09monochromeBitmapCompression+%3D+BitmapCompression.zip%3B%0D%0A++++%09monochromeBitmapSampling+%3D+Sampling.NONE%3B%0D%0A++++++%0D%0A++++%09compressionType+%3D+PDFCompressionType.compressObjects%3B%0D%0A++++%09compressTextAndLineArt+%3D+true%3B%0D%0A%09%09cropImagesToFrames+%3D+true%3B%0D%0A%09%09optimizePDF+%3D+true%3B%0D%0A%09%09facingPages+%3D+false%3B%0D%0A++++++++var+docPreferences+%3D+doc.documentPreferences%3B%0D%0A++++%09bleedBottom+%3D+docPreferences.documentBleedBottomOffset%3B%0D%0A++++%09bleedTop+%3D+docPreferences.documentBleedTopOffset%3B%0D%0A++++%09bleedInside+%3D+docPreferences.documentBleedInsideOrLeftOffset%3B%0D%0A++++%09bleedOutside+%3D+docPreferences.documentBleedOutsideOrRightOffset%3B%0D%0A++++++++if(bleedBottom+%26%26+bleedTop+%26%26+bleedInside+%26%26+bleedInside)%7B%7B%0D%0A++++%09%09bleedMarks+%3D+true%3B%0D%0A++++%09%7D%7D%0D%0A++++%09else%7B%7B%0D%0A++++%09%09bleedMarks+%3D+true%3B%0D%0A++++%09%7D%7D%0D%0A++++%09colorBars+%3D+false%3B%0D%0A++++%09colorTileSize+%3D+128%3B%0D%0A++++%09grayTileSize+%3D+128%3B%0D%0A++++%09cropMarks+%3D+true%3B%0D%0A%09%09pageMarksOffset+%3D+%226+pt%22%3B%0D%0A++++%09omitBitmaps+%3D+false%3B%0D%0A++++%09omitEPS+%3D+false%3B%0D%0A++++%09omitPDF+%3D+false%3B%0D%0A++++%09pageInformationMarks+%3D+false%3B%0D%0A++++%09pdfColorSpace+%3D+PDFColorSpace.unchangedColorSpace%3B%0D%0A++++%09pdfMarkType+%3D+1147563124%3B%0D%0A++++%09printerMarkWeight+%3D+PDFMarkWeight.p125pt%3B%0D%0A++++%09registrationMarks+%3D+false%3B%0D%0A++++%09try%7B%7B%0D%0A++++%09%09simulateOverprint+%3D+false%3B%0D%0A++++%09%7D%7D%0D%0A++++%09catch(e)%7B%7B%7D%7D%0D%0A++++%09useDocumentBleedWithPDF+%3D+true%3B%0D%0A++++%09viewPDF+%3D+false%3B%0D%0A++++%7D%7D%0D%0A%0D%0Afunction+forEach(arr%2C+func)%7B%7Bif(arr+%26%26+arr.length)%7B%7Bfor(var+i%3D0%3B+i%3Carr.length%3B+i%2B%2B)%7B%7Bfunc(arr%5Bi%5D)%3B%7D%7D+%7D%7D+%7D%7D%0D%0A%0D%0Avar+percent+%3D+0.95%3B%0D%0Avar+increment+%3D+-0.1%3B%0D%0A%0D%0Afunction+handleOverflow(document)+%7B%7B%0D%0A++++with+(document)+%7B%7B%0D%0A++++++++var+done%2C+minimum%2C+i%3B%0D%0A++++++++forEach(textFrames%2C+function(frame)+%7B%7B%0D%0A++++++++++++done+%3D+false%3B%0D%0A++++++++++++if+(isOverflowing(frame.parentStory))+%7B%7B%0D%0A++++++++++++++++minimum+%3D+frame.parentStory.horizontalScale+*+percent%3B%0D%0A++++++++++++++++done+%3D+adjustOverflowingStory(frame.parentStory%2C+%27horizontalScale%27%2C+increment%2C+minimum)%3B%0D%0A++++++++++++%7D%7D%0D%0A++++++++++++if+(!done+%26%26+isOverflowing(frame.parentStory))+%7B%7B%0D%0A++++++++++++++++minimum+%3D+frame.parentStory.pointSize+*+percent%3B%0D%0A++++++++++++++++done+%3D+adjustOverflowingStory(frame.parentStory%2C+%27pointSize%27%2C+increment%2C+minimum)%3B%0D%0A++++++++++++%7D%7D%0D%0A++++++++%7D%7D)%3B%0D%0A++++%7D%7D%0D%0A%7D%7D%0D%0A%0D%0Afunction+isOverflowing(story)+%7B%7B%0D%0A++++return+story+%26%26+story.overflows%3B%0D%0A%7D%7D%0D%0A%0D%0Afunction+adjustOverflowingStory(story%2C+property%2C+increment%2C+minimum)+%7B%7B%0D%0A++++while+(story.overflows)+%7B%7B%0D%0A++++++++story%5Bproperty%5D+%2B%3D+increment%3B%0D%0A++++++++if+(story%5Bproperty%5D+%3C%3D+minimum)%0D%0A++++++++++++return+story.overflows%3B%0D%0A++++%7D%7D%0D%0A++++return+true%3B%0D%0A%7D%7D%0D%0A%0D%0AhandleOverflow(doc)%3B%0D%0A%0D%0Adoc.exportFile(ExportFormat.pdfType%2C+new+File(%27%7B1%7D%27))%3B%0D%0Adoc.close(SaveOptions.no)%3B%0D%0A'
};

function getUid() {
	return new Promise((resolve, reject) => {
		var body = '';
		const postData = querystring.stringify({});
		const options = {
			hostname: BASE_URL,
			port: 80,
			path: idmlServiceRoot + '/getuid',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData)
			}
		};
		const req = http.request(options, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				resolve(JSON.parse(body));
			});
		});
		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		req.write(postData);
		req.end();
	});
}

function createInstance(uid) {
	return new Promise((resolve, reject) => {
		let body = '';
		const postData = idmlText;
		const path = `${idmlServiceRoot}/createInstance?instanceId_=${uid}&name=${templateName}&sessionId=${sessionId}&numberOfPages=${numPagesInTemplate}&saveForPrint=true`;
		const req = http.request({
			hostname: BASE_URL,
			port: 80,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				'Content-Length': Buffer.byteLength(postData)
			}
		}, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				resolve(JSON.parse(body));
			});
		});
		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		req.write(postData);
		req.end();
	});
}

function publishPdf(guid, version) {
	return new Promise((resolve, reject) => {
		let body = '';
		const path = `${foxProxyRoot}/PublishPDF?sessionId=${sessionId}&name=${guid}&version=${version}&script=${scripts[version]}`;
		const req = http.request({
			hostname: BASE_URL,
			port: 80,
			path: path,
			method: 'GET',
		}, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				resolve({guid: guid, result: JSON.parse(body)});
			});
		});

		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});

		req.end();
	});
}

function delay( ms = 1000) {
	return new Promise(resolve => { setTimeout(resolve, ms) });
}
async function waitForFile(filePath) {
	var exist = fs.existsSync(filePath);
	if (!exist) {
		await delay(1000);
		return waitForFile(filePath);
	}
	return {file: filePath, stat: fs.lstatSync(filePath)};
}

function reportSingleFile(result) {
	console.log(`File ${result.file} is done. File size is ${result.stat.size}. Waiting for the rest.`);
	return result;
}

var idmlText = fs.readFileSync('./idml-data.xml', 'utf8');

process.env.NO_DEPRECATION = 'tedious'; // <-- prevent unneccesary deprecation warning

let spinner = ora({text: 'Getting GUID\'s...', color: 'green'}).start();
const jobs = [getUid(), getUid()];
Promise.all(jobs)
	.then(guids => {
		console.log(chalk.green(' Guids recieved: \n'), guids, '\n');
		spinner.text = 'Creating instances...';
		return Promise.all(guids.map(uid => createInstance(uid)))
	})
	.then(result => {
		console.log(chalk.green(' Instances created'), '\n');
		spinner.text = 'Creating PDF\'s...';
		result.forEach(row => publishPdf(row.Data.InstanceId, 'low'));
		return Promise.all(result.map(row => publishPdf(row.Data.InstanceId, 'hi')))
	})
	.then(done => {
		console.log(chalk.green(' PDF\'s published!'), '\n');
		spinner.text = 'Getting PDF paths...';
		return Promise.all(done.map(item => fii.getPdfFromGuid(item.guid, {quality: 'hi'})))
	})
	.then(allDone => {
		console.log(chalk.green(' File path\'s retrieved\n'), allDone, '\n');
		spinner.text = 'Checking file sizes...';
		spinner.color = 'yellow';
		Promise.all(allDone.map(file => waitForFile(file).then(reportSingleFile))).then(results => {
			console.log(chalk.green(' The sizes: \n'), results.map(res => res.stat.size).join(', '));
			// console.log(process._getActiveHandles(), process._getActiveRequests());
			process.exit();
		});
	});