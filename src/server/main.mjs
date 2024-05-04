import {SystemLogger as Logger} from "../shared/libs/Logger.mjs"
process.env.LOG_LEVEL = 4
import Webserver from "./webserver.mjs"
import Socketserver from "./socketserver.mjs"

import SocketListener from "./listeners/socket_listener.mjs"
import TelegramListener from "./listeners/telegram_listener.mjs"
import Cookie from "./controllers/cookie_controller.mjs"
import CustomerMessenger from "./messengers/customer_messenger.mjs"
import TelegramMessenger from "./messengers/telegram_messenger.mjs"
import Commander from "./controllers/command_controller.mjs"
import FileReceiver from "./libs/FileReceiver.mjs"
import FileUpload from "./classes/FileUpload.mjs"

const {app, server} = Webserver.start()
const io = Socketserver.start(server)

/////////////////////
// Socket listener //
/////////////////////

SocketListener.on("message", TelegramMessenger.handleCustomerMessage)
SocketListener.on("transfer_request", FileReceiver.handleTransferRequest)
SocketListener.onRegister = async (name, hash) => {
	Logger.debug(`New connection: ${name} => ${hash}`)
	CustomerMessenger.setCookie(name, Cookie.generate(name))
}
SocketListener.onReturn = async (hash) => {
	Logger.debug(`Returned: ${hash}`)
}
SocketListener.onUnregister = async (hash) => {
	Logger.debug(`Left: ${hash}`)
}
SocketListener.listen(io) // handle socket connections during page loads

/////////////////
// File upload //
/////////////////

FileReceiver.onTransferComplete = async (oResult, cb)=>{
	Logger.debug("Transfer complete, preparing object for delivery")
	Logger.debug(oResult)
	if (oResult.ok) {
		const upload = await FileUpload.parse(oResult.name)
		cb({
			ok: true,
			message: upload.toCustomerMessage("customer")
		})
		TelegramMessenger.sendFile(oResult.cookie, upload)
	} else {
		cb(oResult)
	}

}
///////////////////////
// Telegram Listener //
///////////////////////

TelegramListener.onCommand = async (message)=>{
	Commander.parse(message)
}
TelegramListener.onChannelCreation = async (message)=>{
	TelegramMessenger.handleChannelCreation(message)
}
TelegramListener.onGroupCreation = async (message)=>{
	TelegramMessenger.handleGroupCreation(message)

}
TelegramListener.onForumCreation = async (message)=>{
	TelegramMessenger.handleForumCreation(message)

}
TelegramListener.onServiceMessage = async (message)=>{
	CustomerMessenger.sendMessage(message)
}
TelegramListener.listen(app, "/hook")
