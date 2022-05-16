'use strict';

const fs = require('fs');
const path = require('path');
const ensUtils = require('./index');

let [cmd, category, filepath] = process.argv.slice(2);

const ens = ensUtils({log: true, onchain:false});


async function main() {
	if (cmd === 'init') {
		ens.defaultCategories();
	}

	if (cmd === 'add') {
		const contents = fs.readFileSync(path.join(process.cwd(), filepath), 'utf-8');

		ens.addCategory(category, contents.replace(/,/g, ' ').split(/[\r\n\s]/g), {save:true})
	}

	if (cmd === 'holders') {
		await (category
			? ens.withHolders(category)
			: ens.walkCategories((key) => ens.withHolders(key), { exclude: [] }));
	}

	if (cmd === 'fix-holders') {
		await (category
			? ens.fixHolders(category)
			: ens.walkCategories((key) => ens.fixHolders(key), { exclude: [] }));
	}

	if (cmd === 'sort-holders') {
		category
			? ens.sortHolders(category)
			: ens.walkCategories((key) => ens.sortHolders(key), { exclude: [] });
	}

}

main().then(() => console.log('done'));

/* HEX CLUB testing
 * 

const AZ = 'abcdef';
const _09 = '0123456789';
const res = [];

[...AZ].forEach((x, i) => {
	[..._09].forEach(n => {
		res.push(x + n)
	})
});

[..._09].forEach((x, i) => {
	[...AZ].forEach(n => {
		res.push(x + n)
	})
});

console.log(res, res.length);
*/
