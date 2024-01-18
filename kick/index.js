const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

function kickChannelInfo(channels) {
    return new Promise(async (resolve, reject) => {
        try {
            puppeteer.use(stealthPlugin());
            
            const browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium-browser',
                headless: "new"
            });

            const page = await browser.newPage() 
            
            async function getStats(channelName) {
                await page.goto(`https://kick.com/api/v1/channels/${channelName}`);

                // checks if channel exists
                let extractedText = await page.$eval('*', (el) => el.innerText);

                if (extractedText.length == 13) return false;
                try {
                    extractedText = JSON.parse(extractedText)
                } catch(err) {
                    return false;
                }
                
                let infoObject = {
                    name: extractedText.slug,
                    displayName: extractedText.user.username,
                    profileImageURL: extractedText.user.profile_pic != null ? extractedText.user.profile_pic : '',
                    streamURL: `https://kick.com/${channelName}`,
                    verified: extractedText.verified != null,
                    followers: extractedText.followersCount,
                    live: extractedText.livestream != null,
                    viewers: extractedText.livestream != null ? extractedText.livestream.viewer_count : 0,
                    streamTitle: extractedText.livestream != null ? extractedText.livestream.session_title : '',
                    catagory: extractedText.livestream != null ? extractedText.livestream.categories[0].name : '',
                    tags: extractedText.livestream != null ? extractedText.livestream.tags : [],
                    streamThumbnail: extractedText.livestream != null ? extractedText.livestream.thumbnail.url : '',
                    streamStartTime: extractedText.livestream != null ? new Date(extractedText.livestream.start_time + 'z').getTime()/1000 : 0,
                }

                return infoObject;
            }

            let newInfoArray = [];
            for (let i = 0; i < channels.length; i++) {
                let newInfoObject = await getStats(channels[i], i)
                if (newInfoObject) newInfoArray.push(newInfoObject);   
            }

            const pages = await browser.pages();
            await Promise.all(pages.map(async (page) => page.close()));
            
            await browser.close()
            resolve(newInfoArray);
        } catch(err) {
            console.log(err);
            reject();
        }
    })
}

app.post('/', (req, res) => {
    let isValid = true;
    for (let i = 0; i < req.body.length; i++) {
        if (isValid) {
            isValid = (req.body[i]).match(/^[a-zA-Z0-9_]+$/i);
        }
    }

    if (req.body.length > 50) {
        res.status(400).json({error: "50 channels max."});
    } else if (isValid) {
        kickChannelInfo(req.body).then(body => {
            res.status(200).json({ body });
        }).catch((err) => {
            console.error(err);
            res.status(500).json({error: "Internal Server Error"})
        });
    } else {
        res.status(400).json({error: "Bad Request"});
    }
});

exports.kick = app;