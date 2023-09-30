const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

// takes a string of numbers with commas, and returns only a number
function parseViewers(viewerString) {
    const numArray = Array.from(viewerString);
    let followerNumArray = [];

    for (let i = 0; i < numArray.length; i++) {
        if (!isNaN(numArray[i])) {
            followerNumArray.push(numArray[i]);
        }
    }

    const viewersNum = parseInt(followerNumArray.join(''));
    return viewersNum;
}

async function getInfo(channelName) {
    // getting the "html" to parse throuh
    const response = await fetch(`https://youtube.com/@${channelName}`);
    const textHtml = await response.text();

    // convert to cheerio object
    let ytData;
    const $ = cheerio.load(textHtml);

    //check if channel is valid
    if ($('title').text() === '404 Not Found') return false;

    $('script').each((index, element) => {
        const html = $(element).html();
        const varName = 'var ytInitialData = ';
        
        // if the script tag contains the variable we are looking for
        if (html.includes(varName)) {
            // cleaning text and getting an object
            const startIndex = html.indexOf('var ytInitialData = ') + 'var ytInitialData = '.length;
            const endIndex = html.indexOf('};', startIndex) + 1;
            const onlyObject = html.slice(startIndex, endIndex);
            ytData = JSON.parse(onlyObject);
        }
    })

    // defining the channel info object
    const infoObject = {
        name: channelName,
        displayName: '',
        profileImageURL: '',
        streamURL: `https://youtube.com/@${channelName}`,
        verified: false,
        live: false,
        viewers: 0,
        streamTitle: '',
        streamThumbnail: '',
    }

    

    // setting verfied status
    if (ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[2].itemSectionRenderer.contents[0].shelfRenderer) {
        infoObject.verified = true
    };

    // setting profile image
    infoObject.profileImageURL = ytData.header.c4TabbedHeaderRenderer.avatar.thumbnails[2].url;

    // setting display name
    infoObject.displayName = ytData.header.c4TabbedHeaderRenderer.title;
    
    // if channel is live
    if (ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].channelFeaturedContentRenderer) {
        // setting live to true
        infoObject.live = true

        // setting viewers
        const viewCount = ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].channelFeaturedContentRenderer.items[0].videoRenderer.viewCountText.runs[0].text;
        infoObject.viewers = parseViewers(viewCount);

        // setting stream title
        infoObject.streamTitle = ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].channelFeaturedContentRenderer.items[0].videoRenderer.title.runs[0].text;

        // setting stream url
        const videoId = ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].channelFeaturedContentRenderer.items[0].videoRenderer.videoId;
        infoObject.streamURL = `https://www.youtube.com/watch?v=${videoId}`;

        // setting stream thumbnail
        infoObject.streamThumbnail = ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].channelFeaturedContentRenderer.items[0].videoRenderer.thumbnail.thumbnails[3].url;
    };

    return infoObject;
}

function youtubeChannelInfo(channels) {
    return new Promise(async (resolve, reject) => {
        try {
            let newDataArray = [];
            for (let i = 0; i < channels.length; i++) {
                let newInfoObject = await getInfo(channels[i]);
                if (newInfoObject != false) newDataArray.push(newInfoObject);
            }
            resolve(newDataArray);
        } catch(err) {
            reject(err)
        } 
    });
}

app.post('/', (req, res) => {
    let isValid = true;
    for (let i = 0; i < req.body.length; i++) {
        if (isValid) {
            isValid = (req.body[i]).match(/^[a-zA-Z0-9_]+$/i);
        }
    }

    if (isValid) {
        youtubeChannelInfo(req.body).then(body => {
            res.status(200).json({ body });
        }).catch((err) => {
            console.error(err);
            res.status(500).json({error: "Internal Server Error"})
        });
    } else {
        res.status(400).json({error: "Bad Request"});
    }
});

exports.youtube = app;