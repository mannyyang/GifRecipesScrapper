"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const osmosis = require("osmosis");
const elasticsearch = require("elasticsearch");
const ESClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});
let previousData = {
    id: '',
    author: '',
    link: '',
    linkType: '',
    comments: []
};
osmosis
    .get('https://www.reddit.com/r/GifRecipes/')
    .paginate('.nav-buttons .next-button a', 5)
    .find('.thing.link')
    .set({
    id: '@data-fullname',
    title: '.title a',
    author: '@data-author',
    description: '@data-context',
    link: '@data-url',
    linkType: '@data-domain',
    timeStamp: '@data-timestamp',
})
    .follow('.entry .flat-list a.comments@href')
    .find('.comment')
    .set({
    comments: [{
            author: '.entry a.author',
            comment: '.entry .usertext-body'
        }]
})
    .delay(100)
    .data(function (listing) {
    //console.log(listing)
    if (!previousData) {
        previousData = listing;
    }
    else if (previousData.id === listing.id) {
        previousData.comments = previousData.comments.concat(listing.comments);
    }
    else {
        if (['t3_5s58rb', 't3_6dz9qm'].indexOf(previousData.id) < 0 && ['i.redd.it', 'self.GifRecipes'].indexOf(previousData.linkType) < 0) {
            let recipe = "";
            for (let i = 0; i < previousData.comments.length; i++) {
                if ((previousData.comments[i].comment.search(/ingredients/i) > -1)
                    && (previousData.comments[i].author === previousData.author)) {
                    recipe = previousData.comments[i].comment;
                }
            }
            previousData.link = updateVideoSrc(previousData.link);
            ESClient.index({
                // opType: 'index',
                index: 'reddit',
                type: 'post',
                id: previousData.id,
                body: Object.assign({}, previousData, { recipe: recipe })
            });
        }
        previousData = listing;
    }
});
function updateVideoSrc(value) {
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
}
function isImgurSrc(url) {
    return url.indexOf('i.imgur.com') >= 0;
}
function isGfySrc(url) {
    return url.indexOf('gfycat.com') >= 0;
}
//# sourceMappingURL=index.js.map