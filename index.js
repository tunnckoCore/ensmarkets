'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pMap = require('p-map');
const ethers = require('ethers');
const fetch = require('node-fetch');
const arrIncludes = require('arr-includes');
const keccak256 = require('js-sha3').keccak_256;

const etherscanNFT = 'https://etherscan.io/nft/';
const ENS_CONTRACT_ADDR = '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85';
const ENS_CONTRACT_ABI = require('./ens-contract-abi.json');

const PROVIDER = ethers.getDefaultProvider('homestead', {
	alchemy: process.env.ALCHEMY_APIKEY,
	etherscan: process.env.ETHERSCAN_APIKEY
})
const CONTRACT = new ethers.Contract(ENS_CONTRACT_ADDR, ENS_CONTRACT_ABI, PROVIDER);

module.exports = (options) => {
	const settings = {sixDigits: false, onchain: true, ...options};
	const categories = {...settings.categories};
	const DATE = settings.date || new Date().toISOString().slice(0, 10);
	const addr = settings.contractAddress || ENS_CONTRACT_ADDR;
	
	settings.log && console.log('DATE', new Date().toISOString());
	
	const etherscan = etherscanNFT + addr + '/';
	settings.date = DATE;
	
	function getPath(category, options) {
		const opts = {...settings, snapshot: false, ...options};
		
		return getFilepath(category, opts);
	}
	
	function dataForLabel(label) {
		const hash = keccak256(label);
		return { id: ethers.BigNumber.from('0x' + hash).toString(), name: label + '.eth', hash }
	}
	
	function addCategory(category, names, options) {
		const opts = {lite: true, save: false, ...settings, ...options};
		const club = String(category).trim();
		categories[club] = categories[club] || {};
		
		const labels = names.map(x => x.endsWith('.eth') ? x.slice(0, -4) : x);
		
		categories[club].info = { ...(opts.info || {}) };
		categories[club].data = labels.reduce((acc, label) => {
			const val = dataForLabel(label);
			acc[label] = opts.lite ? val.id : val;
			return acc;
		}, {})
		categories[club].info.supply = Object.keys(categories[club].data).length;
		categories[club].info.name = category;
		
		opts.log && console.log('creating', club, 'club');
		opts.save && saveState(club, categories[club]);
		return categories[club];
	}
	
	function defaultCategories() {
		addCategory('The999', generateClub({ end: 1000, pad: 3 }), {save:true});

		addCategory('0xN', generate0xDigits({ pad: 0, end: 10 }), {save:true});
		addCategory('0x99', generate0xDigits(), {save:true});
		addCategory('0x1k', generate0xDigits({ end: 1000, pad: 3 }), {save:true});

		addCategory('24h', generateClub({ pad: 4, end: 2360, is24h: true }), {save:true});
		addCategory('4-digit-hours', generateClub({ pad: 4, end: 2360, isHours: true }), {save:true});
		addCategory('4-digit-dates', generateClub({ pad: 4, start: 100, end: 1232, isDates: true }), {save:true});
		
		// hyphens
		// 520 = L-N and N-L
		const hyphensLN = `0-a 0-b 0-c 0-d 0-e 0-f 0-g 0-h 0-i 0-j 0-k 0-l 0-m 0-n 0-o 0-p 0-q 0-r 0-s 0-t 0-u 0-v 0-w 0-x 0-y 0-z 1-a 1-b 1-c 1-d 1-e 1-f 1-g 1-h 1-i 1-j 1-k 1-l 1-m 1-n 1-o 1-p 1-q 1-r 1-s 1-t 1-u 1-v 1-w 1-x 1-y 1-z 2-a 2-b 2-c 2-d 2-e 2-f 2-g 2-h 2-i 2-j 2-k 2-l 2-m 2-n 2-o 2-p 2-q 2-r 2-s 2-t 2-u 2-v 2-w 2-x 2-y 2-z 3-a 3-b 3-c 3-d 3-e 3-f 3-g 3-h 3-i 3-j 3-k 3-l 3-m 3-n 3-o 3-p 3-q 3-r 3-s 3-t 3-u 3-v 3-w 3-x 3-y 3-z 4-a 4-b 4-c 4-d 4-e 4-f 4-g 4-h 4-i 4-j 4-k 4-l 4-m 4-n 4-o 4-p 4-q 4-r 4-s 4-t 4-u 4-v 4-w 4-x 4-y 4-z 5-a 5-b 5-c 5-d 5-e 5-f 5-g 5-h 5-i 5-j 5-k 5-l 5-m 5-n 5-o 5-p 5-q 5-r 5-s 5-t 5-u 5-v 5-w 5-x 5-y 5-z 6-a 6-b 6-c 6-d 6-e 6-f 6-g 6-h 6-i 6-j 6-k 6-l 6-m 6-n 6-o 6-p 6-q 6-r 6-s 6-t 6-u 6-v 6-w 6-x 6-y 6-z 7-a 7-b 7-c 7-d 7-e 7-f 7-g 7-h 7-i 7-j 7-k 7-l 7-m 7-n 7-o 7-p 7-q 7-r 7-s 7-t 7-u 7-v 7-w 7-x 7-y 7-z 8-a 8-b 8-c 8-d 8-e 8-f 8-g 8-h 8-i 8-j 8-k 8-l 8-m 8-n 8-o 8-p 8-q 8-r 8-s 8-t 8-u 8-v 8-w 8-x 8-y 8-z 9-a 9-b 9-c 9-d 9-e 9-f 9-g 9-h 9-i 9-j 9-k 9-l 9-m 9-n 9-o 9-p 9-q 9-r 9-s 9-t 9-u 9-v 9-w 9-x 9-y 9-z a-0 a-1 a-2 a-3 a-4 a-5 a-6 a-7 a-8 a-9 b-0 b-1 b-2 b-3 b-4 b-5 b-6 b-7 b-8 b-9 c-0 c-1 c-2 c-3 c-4 c-5 c-6 c-7 c-8 c-9 d-0 d-1 d-2 d-3 d-4 d-5 d-6 d-7 d-8 d-9 e-0 e-1 e-2 e-3 e-4 e-5 e-6 e-7 e-8 e-9 f-0 f-1 f-2 f-3 f-4 f-5 f-6 f-7 f-8 f-9 g-0 g-1 g-2 g-3 g-4 g-5 g-6 g-7 g-8 g-9 h-0 h-1 h-2 h-3 h-4 h-5 h-6 h-7 h-8 h-9 i-0 i-1 i-2 i-3 i-4 i-5 i-6 i-7 i-8 i-9 j-0 j-1 j-2 j-3 j-4 j-5 j-6 j-7 j-8 j-9 k-0 k-1 k-2 k-3 k-4 k-5 k-6 k-7 k-8 k-9 l-0 l-1 l-2 l-3 l-4 l-5 l-6 l-7 l-8 l-9 m-0 m-1 m-2 m-3 m-4 m-5 m-6 m-7 m-8 m-9 n-0 n-1 n-2 n-3 n-4 n-5 n-6 n-7 n-8 n-9 o-0 o-1 o-2 o-3 o-4 o-5 o-6 o-7 o-8 o-9 p-0 p-1 p-2 p-3 p-4 p-5 p-6 p-7 p-8 p-9 q-0 q-1 q-2 q-3 q-4 q-5 q-6 q-7 q-8 q-9 r-0 r-1 r-2 r-3 r-4 r-5 r-6 r-7 r-8 r-9 s-0 s-1 s-2 s-3 s-4 s-5 s-6 s-7 s-8 s-9 t-0 t-1 t-2 t-3 t-4 t-5 t-6 t-7 t-8 t-9 u-0 u-1 u-2 u-3 u-4 u-5 u-6 u-7 u-8 u-9 v-0 v-1 v-2 v-3 v-4 v-5 v-6 v-7 v-8 v-9 w-0 w-1 w-2 w-3 w-4 w-5 w-6 w-7 w-8 w-9 x-0 x-1 x-2 x-3 x-4 x-5 x-6 x-7 x-8 x-9 y-0 y-1 y-2 y-3 y-4 y-5 y-6 y-7 y-8 y-9 z-0 z-1 z-2 z-3 z-4 z-5 z-6 z-7 z-8 z-9`.split(' ');
		// 676
		const hyphensAZ = `a-a a-b a-c a-d a-e a-f a-g a-h a-i a-j a-k a-l a-m a-n a-o a-p a-q a-r a-s a-t a-u a-v a-w a-x a-y a-z b-a b-b b-c b-d b-e b-f b-g b-h b-i b-j b-k b-l b-m b-n b-o b-p b-q b-r b-s b-t b-u b-v b-w b-x b-y b-z c-a c-b c-c c-d c-e c-f c-g c-h c-i c-j c-k c-l c-m c-n c-o c-p c-q c-r c-s c-t c-u c-v c-w c-x c-y c-z d-a d-b d-c d-d d-e d-f d-g d-h d-i d-j d-k d-l d-m d-n d-o d-p d-q d-r d-s d-t d-u d-v d-w d-x d-y d-z e-a e-b e-c e-d e-e e-f e-g e-h e-i e-j e-k e-l e-m e-n e-o e-p e-q e-r e-s e-t e-u e-v e-w e-x e-y e-z f-a f-b f-c f-d f-e f-f f-g f-h f-i f-j f-k f-l f-m f-n f-o f-p f-q f-r f-s f-t f-u f-v f-w f-x f-y f-z g-a g-b g-c g-d g-e g-f g-g g-h g-i g-j g-k g-l g-m g-n g-o g-p g-q g-r g-s g-t g-u g-v g-w g-x g-y g-z h-a h-b h-c h-d h-e h-f h-g h-h h-i h-j h-k h-l h-m h-n h-o h-p h-q h-r h-s h-t h-u h-v h-w h-x h-y h-z i-a i-b i-c i-d i-e i-f i-g i-h i-i i-j i-k i-l i-m i-n i-o i-p i-q i-r i-s i-t i-u i-v i-w i-x i-y i-z j-a j-b j-c j-d j-e j-f j-g j-h j-i j-j j-k j-l j-m j-n j-o j-p j-q j-r j-s j-t j-u j-v j-w j-x j-y j-z k-a k-b k-c k-d k-e k-f k-g k-h k-i k-j k-k k-l k-m k-n k-o k-p k-q k-r k-s k-t k-u k-v k-w k-x k-y k-z l-a l-b l-c l-d l-e l-f l-g l-h l-i l-j l-k l-l l-m l-n l-o l-p l-q l-r l-s l-t l-u l-v l-w l-x l-y l-z m-a m-b m-c m-d m-e m-f m-g m-h m-i m-j m-k m-l m-m m-n m-o m-p m-q m-r m-s m-t m-u m-v m-w m-x m-y m-z n-a n-b n-c n-d n-e n-f n-g n-h n-i n-j n-k n-l n-m n-n n-o n-p n-q n-r n-s n-t n-u n-v n-w n-x n-y n-z o-a o-b o-c o-d o-e o-f o-g o-h o-i o-j o-k o-l o-m o-n o-o o-p o-q o-r o-s o-t o-u o-v o-w o-x o-y o-z p-a p-b p-c p-d p-e p-f p-g p-h p-i p-j p-k p-l p-m p-n p-o p-p p-q p-r p-s p-t p-u p-v p-w p-x p-y p-z q-a q-b q-c q-d q-e q-f q-g q-h q-i q-j q-k q-l q-m q-n q-o q-p q-q q-r q-s q-t q-u q-v q-w q-x q-y q-z r-a r-b r-c r-d r-e r-f r-g r-h r-i r-j r-k r-l r-m r-n r-o r-p r-q r-r r-s r-t r-u r-v r-w r-x r-y r-z s-a s-b s-c s-d s-e s-f s-g s-h s-i s-j s-k s-l s-m s-n s-o s-p s-q s-r s-s s-t s-u s-v s-w s-x s-y s-z t-a t-b t-c t-d t-e t-f t-g t-h t-i t-j t-k t-l t-m t-n t-o t-p t-q t-r t-s t-t t-u t-v t-w t-x t-y t-z u-a u-b u-c u-d u-e u-f u-g u-h u-i u-j u-k u-l u-m u-n u-o u-p u-q u-r u-s u-t u-u u-v u-w u-x u-y u-z v-a v-b v-c v-d v-e v-f v-g v-h v-i v-j v-k v-l v-m v-n v-o v-p v-q v-r v-s v-t v-u v-v v-w v-x v-y v-z w-a w-b w-c w-d w-e w-f w-g w-h w-i w-j w-k w-l w-m w-n w-o w-p w-q w-r w-s w-t w-u w-v w-w w-x w-y w-z x-a x-b x-c x-d x-e x-f x-g x-h x-i x-j x-k x-l x-m x-n x-o x-p x-q x-r x-s x-t x-u x-v x-w x-x x-y x-z y-a y-b y-c y-d y-e y-f y-g y-h y-i y-j y-k y-l y-m y-n y-o y-p y-q y-r y-s y-t y-u y-v y-w y-x y-y y-z z-a z-b z-c z-d z-e z-f z-g z-h z-i z-j z-k z-l z-m z-n z-o z-p z-q z-r z-s z-t z-u z-v z-w z-x z-y z-z`.split(' ');

		// N-N 100
		addCategory(
			'hyphens', 
			generateClub({ isHyphens: true, pad: 2, end: 100 })
				.concat(hyphensAZ)
				.concat(hyphensLN),
			{save:true},
		);
		
		addCategory('10k', generateClub({ end: 10000, pad: 4 }), {save:true});
		addCategory('0x10k', generate0xDigits({ end: 10000, pad: 4 }), {save:true});
		
		settings.fiveDigits && addCategory('100k', generateClub({ end: 100000, pad: 5 }), {save:true});
		settings.sixDigits && addCategory('6digits', generateClub({ end: 1000000, pad: 6 }), {save:true});

		
		return categories;
	}
	
	function saveState(category, data, options) {
		const opts = { ...options }
		const club = data || categories[category];
		const filepath = getPath(category, opts);
		
		fs.mkdirSync(path.dirname(filepath), { recursive: true });
		fs.writeFileSync(filepath, JSON.stringify(club, null, 2));
	}
	
	async function walkCategories(mapper, options) {
		const opts = {exclude: [], date: DATE, ...options};
		const clubs = fs.readdirSync('./categories')
			.map(x => path.basename(x, path.extname(x)))
			.filter(x => !arrIncludes(opts.exclude, x));
			
		await pMap(clubs, async (category) => {
			const filepath = getPath(category, opts);
			const value = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
			
			return await mapper(category, value, opts);
		}, opts);
	}
	
	async function fixHolders(category, options) {
		const opts = {...settings, ...options};
		const filepath = getPath(category, {snapshot: true});
		
		const json = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
		const errored = Object.keys(json.data).filter(x => typeof json.data[x] === 'string');
		
		return withHolders(category, {labels: errored, ...opts})
	}
	
	async function fetchOwner(id, label) {
		const cheerio = (await import('cheerio')).default;
		return fetch(etherscan + id)
			.then((res) => res.text())
			.then((htmlBody) => {
				if (htmlBody.includes('Sorry, our servers')) {
					return false;
				}
				
				const $ = cheerio.load(htmlBody);
				const link = $('#ContentPlaceHolder1_divOwner .d-block');
				let addr = link.text();
				
				if (addr.includes('.eth')) {
					addr = link.attr('href') || link.attr('title') || link.attr('data-original-title');
				}
				
				return '0x' + addr.replace('/address/', '').split('0x')[1];
			});
	} 
	
	async function withHolders(category, options) {
		const opts = {...settings, ...options};
		const filepath = getPath(category);
		const holdersPath = opts.labels && getPath(category, {snapshot: true, type:'holders'});
		
		const json = opts.labels
			? JSON.parse(fs.readFileSync(getPath(category, {snapshot: true}), 'utf-8'))
			: JSON.parse(fs.readFileSync(filepath, 'utf-8'));
			
		const holders = opts.labels && JSON.parse(fs.readFileSync(holdersPath, 'utf-8'));
		const owners = opts.labels ? holders.data : {};
		const errors = {};
		
		const labels = opts.labels || Object.keys(json.data);
		
		opts.log && opts.labels && console.log('fixing holders for', category);
		
		await pMap(labels, mapper, { concurrency: 20, ...options });
		
		async function mapper(label) {
			const tokenId = json.data[label];
			
			let hasFailed = false;
			let owner = null;
			let expired = false;
			
			try  {
				owner = await CONTRACT.ownerOf(tokenId);
			} catch(err) {
				if (err.toString().includes('revert')) {
					//console.log(label, tokenId, err);
					hasFailed = true;
					expired = true;
				}
				
				// fallback from etherscan.io/nft/<contract>/<tokenId>	
				try {
					owner = await fetchOwner(tokenId, label);
					hasFailed = false;
				} catch (e) {
					hasFailed = true;
				}
			}
			
			hasFailed = owner === null ? true : hasFailed;
			
			opts.log && console.log(expired ? 'EXPIRED' : '', label, owner);
			
			json.data[label] = hasFailed ? tokenId : { id: tokenId, label, name: label + '.eth', owner }
			
			/* @todo
			 * 
			if (expired) {
				json.info.expired += 1;
				if (!hasFailed) {
					json.data[label].expired = true;
				}
			}
			*/
			if (owner) {
				owners[owner] = owners[owner] || [];
				owners[owner].push(label);
			}
			
			// write per label, cuz failures
			json.info.owners = Object.keys(owners).length;
			
			saveState(category, json, { snapshot: true });
			owner && saveState(category, { info: json.info, data: owners}, { snapshot: true, type: 'holders' });
			return owner;
		}
		
		/*
		json.info.owners = Object.keys(owners).length;
		
		saveState(category, json, { snapshot: true });
		saveState(category, { info: json.info, data: owners}, { snapshot: true, type: 'holders' });
		*/
		opts.log && console.log('wrote', category, 'snapshots');
	}

	
	return {		
		dataForLabel,
		addCategory,
		defaultCategories,
		saveState,
		walkCategories,
		sortHolders,
		
		//withMetadata,
		fixHolders,
		withHolders,
		
		getCategories() {
			return categories;
		},

		generateClub,
		generate0xDigits,
		
		PROVIDER,
		CONTRACT,
		ethers,
		keccak256,
		pMap,
	}
}

module.exports.sortHolders = sortHolders;
function sortHolders(category, options) {
	const opts = {...options};
	const date = opts.date || new Date().toISOString().slice(0, 10);
	const holdersPath = getFilepath(category, {date, snapshot: true, type: 'holders'})
	const holders = JSON.parse(fs.readFileSync(holdersPath, 'utf-8'));
	const data = {};
	
	const sorted = Object.keys(holders.data)
		.sort((a, b) => holders.data[a].length - holders.data[b].length)
		.reverse();
		
	const ranked = sorted
		.reduce((acc, holder) => {
			acc[holder] = holders.data[holder].length;
			data[holder] = holders.data[holder];
			return acc;
		}, {});
	
	const clubData = { info: holders.info, data: data };
	
	fs.writeFileSync(
		getFilepath(category, { date, snapshot: true, type: 'holders' }),
		JSON.stringify({ info: holders.info, data: data }, null, 2)
	)
	fs.writeFileSync(
		getFilepath(category, { date, snapshot: true, type: 'ranked' }),
		JSON.stringify({ info: holders.info, data: ranked }, null, 2)
	)
	
	return {
		holders: data,
		ranked: ranked,
	}
}

module.exports.generateClub = generateClub;
function generateClub(options) {
	const opts = { prefix: '', pad: 4, start: 0, end: 10000, ...options }
	const res = [];
	
	for (let idx = opts.start; idx < opts.end; idx++) {
		const str = String(idx);
		let key = opts.pad > 0 ? str.padStart(opts.pad, '0') : str;
		
		// 4-digit hours (0000-2359), 1440 supply
		// 24h Club (00h00-23h59), 1440 supply
		if (opts.isHours || opts.is24h) {
			const minute = key.slice(2);
			if (Number(minute) > 59) {
				continue;
			}
			
			key = opts.is24h ? key.slice(0, 2) + 'h' + minute : key;
		}
		
		// 4-digit-dates (supports only MMDD, 366 supply),
		// or hyphens
		if (opts.isDates || opts.isHyphens) {
			const _left = key.slice(0, opts.isHyphens ? 1 : 2);
			const _right = key.slice(opts.isHyphens ? 1 : 2);
			const left = Number(_left);
			const right = Number(_right);
			const shorterMonths = [4,6,9,11];
			
			if (opts.isDates) {
				if (left > 12 || right > 31 || right == 0 || (left == 2 && right > 29) || shorterMonths.includes(left) && right > 30) {
					continue;
				}
			}
			
			// 2-digit hyphens club (0-0, 9-4, 2-2, etc)
			if (opts.isHyphens && (left > 9 || right > 9)) {
				continue;
			}
			if (opts.isHyphens) {
				key = left + '-' + right;
			}
		}
		
		res.push(opts.prefix + key);
	}
	
	return res;
}

module.exports.generate0xDigits = generate0xDigits;
function generate0xDigits(options) {
	return generateClub({ start: 0, end: 100, pad: 2, ...options, prefix: '0x' })
}

module.exports.getFilepath = getFilepath;
function getFilepath(category, options) {
	const opts = {...options};
	const dir = opts.snapshot ? 'snapshots' : 'categories';
	const date = opts.snapshot ? '/' + opts.date : '';
	const filename = opts.snapshot ? category.toLowerCase() + (opts.type ? '-' + opts.type : '') : category.toLowerCase();
	return `./${dir}${date}/${filename}.json`;
}




