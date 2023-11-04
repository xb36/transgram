# About
Transgram is a Telegram Chat Widget for your Homepage! It allows you to forward messages from the widget to your Telegram App and vice-versa, thus enabling you to communicate with your website visitors "on the fly" (or on the walk, that is).

Note that this is an early version and may (will) include bugs. Please report any issue you have (and feel welcome to create a pull request) as this helps alot with maintaining the code. Please read this document very carefully.

## Prerequisits
- OS: Linux (preferrably debian) 
- Software:
	- ffmpeg (for fetching file information)

Note that transgram was designed to run on HTTP behind a HTTPS reverse proxy.

## Installation
Clone this repository to any location on your server.

edit .env-example and rename to  .env

CAUTION: custom parser -> read the .env file comments VERY CAREFULLY

`npm install`

`npm run build`

`npm run start`

Register a new telegram bot and set the webhook to your.server.ip/hook. You may use your bot either in a channel, a group or a private chat. Each variant has its own features or limitations. Transgram shines best in forums.

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

## Known bugs
Im some cases, the Telegram API returns 403 (forbidden) upon creation of a new channel, stating that the bot is not a member of the channel chat (even though it is). In this case, the instructions (including the chat id) are not sent. Transgram attemps one retry after 5 seconds, which in most cases also fails. A respective log message will be printed on the server logs. There is no known fix and the cause is unknown at the moment. Just create another channel, until it works.. 

## Disclaimer
This is a 1-year old codebase, and unfortunately I locked myself out of telegram (as my phone broke and I am not able to re-register using SMS). That means that although I made sure that all the basic features are working (especially on the security side of things), there may be inconsitencies between these instructions and the actual behavior of the widget. I will soon continue with the development and update all points necessary. Anyway, be warned that the setup may take you a while, and it may be necessary to dig into the code to fix your issues. Feel free to ask for help and I am happy to support you where I can.