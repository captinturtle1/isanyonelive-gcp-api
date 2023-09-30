const { join } = require('path');

let env = (process.env.NODE_ENV);

// Changes the cache location for Puppeteer when deployed 
//if (env !== 'dev') {
    module.exports = {
        cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
    };
//}