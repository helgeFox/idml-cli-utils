
const fs = require('fs-extra');
const path = require('path');

const uri = 'V:\\IDS\\TEMPLATES\\692\\Test\\Salgsoppgave';
const operations = [
	{
		remove: 'MHE_Prospekt_K1.idml',
		copy: 'MHE_Prospekt_K0.idml'
	},
	{
		remove: 'MHE_Prospekt_K1.indd',
		copy: 'MHE_Prospekt_K0.indd'
	},
	{
		remove: 'MHE_Prospekt_K1.rules',
		copy: 'MHE_Prospekt_K0.rules'
	}
];


operations.forEach(item => {
	fs.unlinkSync(path.join(uri, item.remove));
	fs.copySync(path.join(uri, item.copy), path.join(uri, item.remove));
});