'use strict';

const fs = require('fs');
const path = require('path');
const ensUtils = require('./index');

let [cmd, category, filepath] = process.argv.slice(2);

const ens = ensUtils({log: true, date: '2022-05-16'});

const allClubs = ['the999', '0xn', '0x99', '0x1k', '24h', '4-digit-hours', '4-digit-dates', 'hyphens', '10k', '0x10k', '100k', '6digits']

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
			: ens.walkCategories((key) => ens.sortHolders(key, {date: '2022-05-16'}), { exclude: [] });
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
