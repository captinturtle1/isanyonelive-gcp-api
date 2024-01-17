require('dotenv').config()

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

function convertToSeconds(timeString) {
    const hoursRegex = /(\d+)h/;
    const minutesRegex = /(\d+)m/;
    const secondsRegex = /(\d+)s/;

    const hours = (hoursRegex.exec(timeString) || [])[1] || 0;
    const minutes = (minutesRegex.exec(timeString) || [])[1] || 0;
    const seconds = (secondsRegex.exec(timeString) || [])[1] || 0;

    return (hours * 3600) + (minutes * 60) + parseInt(seconds, 10);
}

function getAccessToken() {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                },    
                body: new URLSearchParams({
                    'client_id': process.env.TWITCH_CLIENT_ID,
                    'client_secret': process.env.TWITCH_CLIENT_SECRET,
                    'grant_type': 'client_credentials'
                })
            };
            
            let response = await fetch('https://id.twitch.tv/oauth2/token', options);
            response = await response.json();
            resolve(response.access_token);
        } catch(err) {
            reject(err);
        }
    });
}

function fetchTwitch(urlParems, accessToken) {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Client-Id': process.env.TWITCH_CLIENT_ID
                }
            };

            let response = await fetch(`https://api.twitch.tv/helix/streams?${urlParems}`, options);
            response = await response.json();

            resolve(response);
        } catch(err) {
            reject(err);
        }
    });
}

function getTwitchUser(loginUrlParams, accessToken) {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Client-Id': process.env.TWITCH_CLIENT_ID
                }
            };
            
            let response = await fetch(`https://api.twitch.tv/helix/users?${loginUrlParams}`, options);
            response = await response.json();
            resolve (response)
        } catch(err) {
            reject(err);
        }
    })
}

function getLatestVideo(user_id, accessToken) {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Client-Id': process.env.TWITCH_CLIENT_ID
                }
            };
            
            let response = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user_id}&first=1`, options);
            response = await response.json();
            resolve(response.data[0]);
        } catch(err) {
            reject(err);
        }
    });
}

function twitchChannelInfo(channels) {
    return new Promise(async (resolve, reject) => {
            try {
                let accessToken = await getAccessToken();
                // constructing api url for streams endpoint
                let urlParems = '';
                for (let i = 0; i < channels.length; i++) {
                    if (i == 0) {
                        urlParems = urlParems.concat('user_login=', channels[i]);
                    } else {
                        urlParems = urlParems.concat('&user_login=', channels[i]);
                    }
                }

                // constructing api url for users endpoint
                let loginUrlParems = '';
                for (let i = 0; i < channels.length; i++) {
                    if (i == 0) {
                        loginUrlParems = loginUrlParems.concat('login=', channels[i]);
                    } else {
                        loginUrlParems = loginUrlParems.concat('&login=', channels[i]);
                    }
                }

                let response = await fetchTwitch(urlParems, accessToken);
                if (response.error) {
                    reject(response);
                }

                let usersResponse = await getTwitchUser(loginUrlParems, accessToken);
                if (usersResponse.error) {
                    reject(usersResponse);
                }
                
                response = response.data;
                usersResponse = usersResponse.data;
                
                let newDataArray = [];
                for (let i = 0; i < usersResponse.length; i++) {
                    /*
                    let latestStream = await getLatestVideo(usersResponse[i].id, accessToken);

                    let whenLastLive;
                    if (latestStream) {
                        whenLastLive = (new Date(latestStream.published_at).getTime()/1000) + convertToSeconds(latestStream.duration);
                    }
                    */
                    
                    let infoObject = {
                        name: usersResponse[i].login,
                        displayName: usersResponse[i].display_name,
                        profileImageURL: usersResponse[i].profile_image_url,
                        streamURL: `https://twitch.tv/${usersResponse[i].login}`,
                        verified: usersResponse[i].broadcaster_type == 'partner',
                        live: false,
                        viewers: 0,
                        streamTitle: '',
                        catagory: '',
                        tags: [],
                        streamThumbnail: '',
                        streamStartTime: 0,
                        //lastStreamTime: whenLastLive,
                    }

                    // loop thru stream endpoint responses to find matching name for current users endpoint
                    for (let j = 0; j < response.length; j++) {
                        if (response[j].user_login == usersResponse[i].login) {
                            infoObject.live = true;
                            infoObject.viewers = response[j].viewer_count;
                            infoObject.streamTitle = response[j].title;
                            infoObject.catagory = response[j].game_name;
                            infoObject.tags = response[j].tags;
                            infoObject.streamThumbnail = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${usersResponse[i].login}.jpg`
                            infoObject.streamStartTime = new Date(response[j].started_at).getTime()/1000;
                        }
                    }
                    newDataArray.push(infoObject);
                }

                resolve(newDataArray)
            } catch(err) {
                console.log(err);
                reject(err);
            }
    });
}

app.post('/', async (req, res) => {
    let isValid = true;
    for (let i = 0; i < req.body.length; i++) {
        if (isValid) {
            isValid = (req.body[i]).match(/^[a-zA-Z0-9_]+$/i);
        }
    }

    if (isValid) {
        try {
            let channelNames = req.body;
            let numOfCalls = Math.ceil(channelNames.length / 100)

            let body = [];
            for (let i = 0; i < numOfCalls; i++) {
                let arraySection = channelNames.splice(0, 100);
                let response = await twitchChannelInfo(arraySection);
                for (let j = 0; j < response.length; j++) {
                    body.push(response[j])
                }
            }
            
            res.status(200).json({ body });
        } catch(err) {
            console.error(err);
            res.status(500).json({error: "Internal Server Error"})
        }
    } else {
        res.status(400).json({error: "Bad Request"});
    }
});

exports.twitch = app;