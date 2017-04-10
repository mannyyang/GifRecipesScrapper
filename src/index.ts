import * as Xray from 'x-ray';

const x = Xray(
	{
		filters: {
			changeVidSrcExt: function (value) {
				if (isImgurSrc(value)) {
					return value.replace('.gifv', '.mp4');
				}
				else if (isGfySrc('gfycat.com')) {
					if (value.indexOf('.mp4') >= 0) {
						return value;
					}
					else {
						return value.replace('gfycat.', 'giant.gfycat.') + '.mp4';
					}
				}
				else {
					return value;
				}
			},
			// reverse: function (value) {
			// 	return typeof value === 'string' ? value.split('').reverse().join('') : value
			// },
			// slice: function (value, start, end) {
			// 	return typeof value === 'string' ? value.slice(start, end) : value
			// }
		}
	}
);

function isImgurSrc(url) {
	return url.indexOf('i.imgur.com') >= 0;
}

function isGfySrc(url) {
	return url.indexOf('gfycat.com') >= 0;
}

x('https://www.reddit.com/r/GifRecipes/', '.thing.link', [{
	id: '@id',
	title: '.title a',
	description: '@data-context',
	link: '.title a@href | changeVidSrcExt',
	linkType: '@data-domain',
	timeStamp: '@data-timestamp'
}])
	.paginate('.nav-buttons .next-button a@href')
	.limit(5)
	.write('results.json')