# IsAnyone.Live GCP API

This repository contains the functions for each endpoint needed to service the isanyone.live webpage and mobile app.

## Installation

1. Clone the repository:

        git clone https://github.com/captinturtle1/isanyonelive-gcp-api.git

2. Navigate to each endpoint directory:

        cd (`/kick`, `/youtube`, `/twitch`).

3. Install dependencies:

        npm install

4. Run the local API for the desired endpoint:

        npm start

6. API will be accessible on http://localhost:8080

## Configuration

You may need to edit kick/index.js and change the executable path for your chromium installation. If running on local, comment out the "executablePath" for "browser" for it to run properly.

## Memory Requirements

- The Kick and Youtube endpoints require a specific memory allocation on GCP for proper functioning. Consider allocating extra memory for optimal performance.

## Twitch API Key

To use the Twitch endpoint, you'll need to obtain a Twitch API key. Follow the instructions in the [Twitch API documentation](https://dev.twitch.tv/docs/api) to obtain your key.

## Kick Endpoint

### Response Object:

| Field             | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `name`            | User's username on Kick                               |
| `displayName`     | User's display name                                   |
| `profileImageURL` | URL to the user's profile image                       |
| `streamURL`       | URL to the user's Kick stream page                    |
| `verified`        | Boolean indicating if the user is verified            |
| `followers`       | Number of followers on Kick                           |
| `live`            | Boolean indicating if the user is currently live      |
| `viewers`         | Number of viewers watching the user's stream          |
| `streamTitle`     | Title of the user's live stream                       |
| `category`        | Category of the stream (e.g., Grand Theft Auto V)     |
| `tags`            | Array of tags associated with the stream              |
| `streamThumbnail` | URL to the thumbnail image of the user's live stream  |
| `streamStartTime` | Unix timestamp of when the user's stream started      |

### Sample Request:

        POST http://localhost:8080
        Body: ["channel1", "channel2", "channel3"]

## YouTube Endpoint

| Field             | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `name`            | YouTube channel username                              |
| `displayName`     | Display name of the YouTube channel                   |
| `profileImageURL` | URL to the profile image of the YouTube channel       |
| `streamURL`       | URL to the live stream on YouTube                      |
| `verified`        | Boolean indicating if the YouTube channel is verified |
| `live`            | Boolean indicating if the channel is currently live   |
| `viewers`         | Number of viewers watching the live stream            |
| `streamTitle`     | Title of the live stream                               |
| `streamThumbnail` | URL to the thumbnail image of the live stream          |

### Sample Request:

        POST http://localhost:8080
        Body: ["channel1", "channel2", "channel3"]

## Twitch Endpoint

| Field             | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `name`            | Twitch channel username                               |
| `displayName`     | Display name of the Twitch channel                    |
| `profileImageURL` | URL to the profile image of the Twitch channel        |
| `streamURL`       | URL to the live stream on Twitch                       |
| `verified`        | Boolean indicating if the Twitch channel is verified  |
| `live`            | Boolean indicating if the channel is currently live   |
| `viewers`         | Number of viewers watching the live stream            |
| `streamTitle`     | Title of the live stream                               |
| `category`        | Category of the stream (e.g., Just Chatting)          |
| `tags`            | Array of tags associated with the stream              |
| `streamThumbnail` | URL to the thumbnail image of the live stream          |
| `streamStartTime` | Unix timestamp of when the stream started              |

### Sample Request:

        POST http://localhost:8080
        Body: ["channel1", "channel2", "channel3"]

## License

This project is licensed under the MIT License.
