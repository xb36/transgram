# About
Transgram is a fully customizable Telegram Chat Widget for your Website! It allows you to forward messages from the widget to your Telegram App and vice-versa, thus enabling you to communicate with your website visitors "on the fly" (or on the walk, that is).

![Gif showcasing the app](https://github.com/xb36/transgram/blob/main/showcase.gif?raw=true)

## Installation

Transgram requires you to have *

**Required packages:**
- nodejs npm git

**Optional packages**
- ffmpeg
- - Required to detect correct filetypes
- apache2
- - for the reverse proxy
- certbot
- - for the [apache] SSL certificate

**Before you start, create a bot to retrieve a HTTP API token !**

```bash
# example for debian based distributions
apt install apache2 nodejs npm git -y
apt install ffmpeg -y
apt install certbot python3-certbot-apache -y
```

Create the unpriviledged system user with $HOME at `/opt/transgram` (use the `-M` option).
```bash
useradd -s /usr/sbin/nologin -d /opt/transgram -M transgram
```
 Let `git` create the directory and give ownership to our user.
```bash
cd /opt
git clone https://github.com/xb36/transgram.git
chown transgram /opt/transgram -R
```
Configure transgram (`/opt/transgram/.env`):
```bash
echo "SECRET_KEY=$(openssl rand -hex 16)" >> /opt/transgram/.env
```
```bash
SECRET_KEY=**<the generated secret>**
TELEGRAM_API_TOKEN=**<telegram bot API token>**
HOST=https://**<your domain>**
PUBLIC_PORT=**<PUBLIC_PORT>**
PORT=**<PROXY_PORT>**
ALLOWED_ORIGINS=*
```
Obtain certbot certificates
```bash
certbot certonly --apache -n --agree-tos --email **<YOUR_EMAIL>** -d **<YOUR_DOMAIN>**
```
Enable apache2 plugins
```bash
a2enmod ssl proxy proxy_http proxy_wstunnel rewrite headers
```
Create dedicated log folder
```bash
mkdir /var/log/apache2/transgram
```
Copy apache2 configuration
```bash
cp /opt/transgram/files/transgram.conf /etc/apache2/sites-available/
```
Configure apache2 (/etc/apache2/sites-available/transgram.conf):
Replace all occurences of `<PUBLIC_PORT>`, `<YOUR_DOMAIN>` and `<PROXY_PORT>` with the appropriate values.

Then, enable the site by running
```bash
a2ensite transgram
```
We are ready now to build the app:
```bash
cd /opt/transgram
sudo -u transgram npm install
sudo -u transgram npm run build
```
If you want a systemd service, copy the appropriate file to the correct location and once again substitute the placeholder values.

```bash
cp /opt/transgram/files/transgram.service /etc/systemd/system/
```

Now start the server and the reverse proxy:
```bash
systemctl start transgram
systemctl start apache2
```
If everything works as expected, you may enable the service upon system boot:
```
systemctl enable transgram 
```

If both services are running, it's a good time to activate the webhook by issuing the following command (you may as well simply open the resulting URL in a webbrowser):
```bash
wget -O - https://api.telegram.org/bot**<YOUR_API_TOKEN>**/setWebhook?url=https://**<YOUR_DOMAIN_NAME**/hook
```
If everything worked, you can now invite the bot to a group chat. The bot will automatically send a message upon invitation including the groups chat_id. We need to add the ID to `/opt/transgram/src/server/server_configuration.mjs
```bash
# ...
transgram_chat_id: 0/**<TRANSGRAM_CHAT_ID>**/,
# ...
```
Finally, restart transgram. 


### Telegram Bot Setup

Also see [telegram bot](https://core.telegram.org/bots).
1. Search for "BotFather" in your Telegram app.
   ![Image showing telegram search](https://github.com/xb36/transgram/blob/main/BotFather_screenshot.png?raw=true)
2. Enter `/start` (or click on "START")
3. Enter `/newbot` to create a new Bot
	3.1. Enter any name for your bot
	3.2. Choose a username for your bot. Note that ist _must_ end in 'bot'.
4. BotFather will give you the HTTP API token that you will need to setup the transgram server.

### The .env file

**Important:** Transgram uses a custom built dotenv-like parser. Read `/opt/transgram/.env-example` for more information.

### Changing client configuration
You find the client configuration file at `/opt/transgram/src/client/client_configuration`. However, I recommend you to set the values on the client server which embeds the chat widget.

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

## Basic Usage

In groups and channels, you will need to use the reply function to answer incoming chat messages. This way, you can still have internal conversations in your group apart from ongoing customer chats. In Supergroups, you can use the `/topic [name]` (or `/thread [name]`) command via a reply to spawn a new thread in which you can chat with the respective customer "normally", without the need of using the reply function. You can use the `/topic` (or `/thread`) command again to create a new thread and close the old one (this may be useful whenever the topic of your conversation changes and you want to keep an overview).

## Message Types

### Message Type Support

At the moment, the following types of media is (mostly) supported:
- text message (including emoticons)
- image
- video
- audio

The following type of media is not supported at the moment:
- voice message

### Security Implications

The uploaded files are stored on your Transgram server. Note that this improves privacy as opposed to fetching the file from the Telegram servers every time the client (re)connects. It as well allows deletion of files on one side without affecting the other.

Note, howver, that there is no authorization mechanism in place other than the filename itself, which is preceeded by a 16 digit alphanumerical part of the sha256 sum of the file, and contains the filename as saved on Telegram (e.g. "file-36") as well as the file ending (e.g. ".mp4"). This allows your support clients to share files, e.g. by sending the link to a file via Email, and protects files from visitors that do not know the filename. Given 26 letters and 10 numbers, the likelyhood for a random guess is around n/36^16, Say you have 1 Million PNG images stored on your server, the likelyhood to find one of them in a random guess would then be around 0.0000000000000000126%, which is a percentage with 16 zeros after the dot and considered "basically zero". However, just be aware that files are not "private" by default, and you may as well want to raise awareness on the clientside about this fact.

## Chat Types
### Groups
This chat type only offers most basic features (sending/receiving messages and files)

### Channels
Channels support message editing and thus allow transgram to display an indicator whether a message was transmitted or not (e.g. chat partner closed website).

### Forum (Supergroup)
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
