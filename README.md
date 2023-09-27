# isanyonelive-gcp-api

isanyonelive-gcp-api contains the functions for each endpoint needed to service the isanyone.live webpage, and mobile app.

Each directory contains everything needed to deploy endpoints to GCP Cloud Functions.

The Kick and Youtube endpoints require more memory allocated on GCP to work properly

Twitch data is retrieved using the Twitch API.

Youtube data retrieved using fetch and parsing the HTML.

Kick data is retrieved using Puppeteer to gather information channel pages.