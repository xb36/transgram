# About
Transgram is a Telegram Chat Widget for your Homepage! It allows you to forward messages from the widget to your Telegram App and vice-versa, thus enabling you to communicate with your website visitors "on the fly" (or on the walk, that is).

Note that this is an early version and may (will) include bugs. Please report any issue you have (and feel welcome to create a pull request) as this helps alot with maintaining the code. Please read this document very carefully.

## Installation

### Prerequisits
- OS: Linux (preferrably debian)
- Software:
- 	- node (minimum v16, latest Version recommended)
	- ffmpeg (for fetching file information)
	- Webserver

(Note that transgram is designed to run on HTTP behind a HTTPS reverse proxy. However there is an option to run it on HTTPS directly.)

### Telegram Bot Setup
First thing you need is a [telegram bot](https://core.telegram.org/bots). You can follow these simple steps:
1. Search for "BotFather" in your Telegram app. Make sure you select the correct one, with a "verified" symbol, as there are many fake duplicates that try to steal your data.

   ![Image showcasing telegram search](https://github.com/xb36/transgram/blob/main/BotFather_screenshot.png?raw=true)

2. Enter `/start` (or click on "START")
3. Enter `/newbot` to create a new Bot
	3.1. Enter any name for your bot
	3.2. Choose a username for your bot. Note that ist _must_ end in 'bot'.
4. BotFather will give you the HTTP API token that you will need to setup the transgram server. Make sure to keep it a secret!

### Basic Server Setup

Clone this repository to any location on your server.

`$``git clone https://github.com/xb36/transgram.git`

edit `.env-example` and rename to `.env`

CAUTION: Transgram uses a custom built dotenv-like parser. Make sure to read the .env file comments __very carefully__ and set the appropriate values. This is also where you will copy the Telegram HTTP API token generated in the previous step.

Before you can build the package, you may want to take a look at `./src/client/client_configuration.js` as well as `./src/server/server_configuration.mjs` and change any default values. If you change any values in this file later, you will need to re-build transgram with the commands below. Note that you will also be able to change the client configuration options from the embedding client without the need to rebuild. The server configuraiton options can only be changed in the respective file, however you will not need to rebuild re project, just restart the server.

Install dependencies and package the build to start it like so:

`npm install`

`npm run build`

`npm run start`

If everything worked, you should see a message stating that the server is listening on the specified port.

![Image showing success message](https://github.com/xb36/transgram/blob/main/run_start_screenshot.png?raw=true)

### Reverse Proxy Setup

Depending on your Webserver, the required steps to configure the reverse proxy differ. In summary, you will need to forward http as well as websocket connections and make sure that files up to 10M (or whatever maximum file size you chose in the server configuration) are allowed.

[This repository](https://github.com/xb36/transgram-reverse-proxy) consists of an example configuration file for apache2 using letsencrypt certificates.

### Embedding Client Setup
Transgram was build with user experience on the client side in mind. Thus, embedding the widget on your page is very straight forward:

```HTML
<script type="text/javascript">
  window.transgram_configuration = {
    transgram_host: "<YOUR_DOMAIN>" /* required */
    /* change any client configuration item here */
  }
</script>
<div id="transgram-root"></div>
<script id="transgram" type="module" src="https://<YOUR_DOMAIN>/widget.js"></script>

```

Note that while it is common that widgets get included via a frame, I chose to do it differently and include it directly on the page. _That has certain implications on how to apply e.g. styles and HTML element ids._

### Connect Transgram <-> Telegram Bot

The last step that is required is to retrieve the Transgram Chat ID and set the respective configuration parameter in `server_configuration.mjs`:

1. Create a Group, a Supergroup or a Channel and invite the Transgram Bot you created earlier (See below for differences in chat types)
2. The bot will send a message containing your Transgram Chat ID. Note that this ID will change when you create a new group or upgrade your group (to a supergroup).
3. Add your transgram_chat_id to `server_configuration.mjs` and restart the server.

That is it, really!

## Chat Types
### private chat
This chat type only offers most basic features (sending/receiving messages and files)

### channel chat
Channels support message editing and thus allow transgram to display an indicator whether a message was transmitted or not (e.g. chat partner closed website).

### forum chat
Forums come with the option to create "threads", thus enabling transgram to manage multiple simultaneous chats in different sub-threads. Unless you are only testing or urgently need the message indicators supported only in channel chats, we recommend you start your bot in this type of chat.

## Upload Error codes
Any errors that occur will be sent to your telegram as well as printed in the server logs. These include:
#### 409: Checksum mismatch
The checksum of the file on the sending and receiving ends differ. This may indicate a security concern or an inconsistent client connection.
#### 413: File is too big
This error contains an additional key `max_size` that indicates the maximum allowed size for this type in bytes.
#### 507: Insufficient storage
Check your storage.


## Generating JSDoc Documentation
For generating documentation from the JSDoc tags, you can run `npm run doc`. This will generate the files as defined in `.jsdoc.json`

## Known bugs
Im some cases, the Telegram API returns 403 (forbidden) upon creation of a new channel, stating that the bot is not a member of the channel chat (even though it is). In this case, the instructions (including the chat id) are not sent. Transgram attemps one retry after 5 seconds, which in most cases also fails. A respective log message will be printed on the server logs. There is no known fix and the cause is unknown at the moment. Just create another channel, until it works.. 

## Support
Feel free to ask for help and I am happy to support you where I can.
