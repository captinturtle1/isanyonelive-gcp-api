const pretty = require('pretty');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// takes a string of numbers with commas, and returns only a number
function parseViewers(viewerString) {
    let numArray = Array.from(viewerString);
    let followerNumArray = [];

    for (let i = 0; i < numArray.length; i++) {
        if (!isNaN(numArray[i])) {
            followerNumArray.push(numArray[i]);
        }
    }

    let viewersNum = parseInt(followerNumArray.join(''));

    return viewersNum;
}

async function getInfo(channelName) {
    // getting the "html" to parse thru and formatting it a bit
    let response = await fetch(`https://youtube.com/@${channelName}`);
    let html = await response.text();
    let prettied = pretty(html); 

    // if invalid channel
    if (prettied.match(/<title>404 Not Found<\/title>/)) return false;

    // defining the channel info object
    let infoObject = {
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

    // setting if the channel is verified
    if (prettied.match(/"style": "BADGE_STYLE_TYPE_VERIFIED"/)) infoObject.verified = true;

    // getting and setting the profile image url
    if (prettied.match(/<link rel="image_src" href="([^"]*)"[^>]*>/)) {
        infoObject.profileImageURL = prettied.match(/<link rel="image_src" href="([^"]*)"[^>]*>/)[1];
    };

    // getting and setting the display name
    if (prettied.match(/<meta property="og:title" content="([^"]*)"[^>]*>/)) {
        infoObject.displayName = prettied.match(/<meta property="og:title" content="([^"]*)"[^>]*>/)[1];
    };
    
    // stuff to do if the channel is live
    if (prettied.match(/"text": "LIVE"/)) {
        // setting live to true
        infoObject.live = true

        // getting and setting viewers
        let matchedViewers = prettied.match(/"viewCountText"\s*:\s*{\s*"runs"\s*:\s*\[\s*{\s*"text"\s*:\s*"([^"]+)"/);
        infoObject.viewers = parseViewers(matchedViewers[1]);

        // getting and setting stream title

        // gets all titles
        let matchedTitles = prettied.match(/"title"\s*:\s*{\s*"runs"\s*:\s*\[\s*{\s*"text"\s*:\s*"([^"]+)"/g);
        let textArray = [];
        for (let i = 0; i < matchedTitles.length; i++) {
            let textValue = matchedTitles[i].match(/"text":\s+"([^"]+)"/);
            textArray.push(textValue[1]);
        }
        if (textArray[0].length == 1 && !isNaN(textArray[0])) {
            // if channel has multiple streams
            infoObject.streamTitle = textArray[1];
        } else {
            // if channel has one stream
            infoObject.streamTitle = textArray[0];
        }

        // getting and setting stream url
        let matchedId = prettied.match(/"videoId"\s*:\s*"([^"]+)"/)
        infoObject.streamURL = `https://www.youtube.com/watch?v=${matchedId[1]}`;

        // setting thumbnail url using video id
        infoObject.streamThumbnail = `https://img.youtube.com/vi/${matchedId[1]}/maxresdefault.jpg`;
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
            res.status(500).json({error: "Internal Server Error"})
        });
    } else {
        res.status(400).json({error: "Bad Request"});
    }
});

exports.youtube = app;