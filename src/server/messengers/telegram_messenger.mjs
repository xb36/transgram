import Cookie from "../controllers/cookie_controller.mjs"
import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import API from "../libs/TelegramAPI.mjs"
import {get_download_url} from "../helpers/url_helper.mjs"

/**
 * @class
 * @hideconstructor
 */
class TelegramMessenger {


	/**
	 * redirects incoming customer message to telegram
	 * and returns the retrieved message_id to the customer
	 *
	 * @param   {Object}   oData object containing customer cookie and message
	 * @param   {Function} cb    socket callback
	 *
	 * @returns {undefined}
	 */
	static async handleCustomerMessage (oData, cb) {
		const cookie = Cookie.read(oData.cookie)

		Logger.debug(oData)

		const payload = `<pre style="bg-color:red">${cookie.name}</pre>\n${oData.message}`

		const response = await API.send(payload, cookie.room)
		if (response.ok)
			cb({
				ok: true,
				id: response.result.message_id

			})
		else
			cb({
				ok: false
			})
	}

	/**
	 * Sends setup instructions upon channel creation
	 *
	 * @returns {undefined} 
	 */
	static async handleChannelCreation(message) {
		this.send_welcome_message(message.chat_id, "(To use the receive-confirmation feature, make sure I have the 'can_edit_messages' priviledge!)")
	}

	/**
	 * Sends setup instructions upon group creation
	 *
	 * @returns {undefined} 
	 */	
	static async handleGroupCreation(message) {
		this.send_welcome_message(message.chat_id, "Hint: If you want to get serious, read about 'Transgram Bot in Forums' on our github page!")
	}

	/**
	 * Sends setup instructions upon forum creation
	 *
	 * @returns {undefined} 
	 */	
	static async handleForumCreation(message) {
		this.send_welcome_message(message.chat_id, "Important: To create topics, you need to grant me administrator rights with the 'manage topic' privilege!")
	}

	/**
	 * Sends welcome message to the newly created group/channel/forum.
	 * On error, a second attempt is started after 5 seconds
	 *
	 * @param   {int}    iChatId       id of the new chat
	 * @param   {String} sInstructions a specific instruction string for the type of chat created
	 * @param   {bool}   isRetry       indicates whether this is a retry
	 *
	 * @returns {undefined}
	 */
	static async send_welcome_message(iChatId, sInstructions, isRetry=false) {
		const payload = `<pre>Transgram Bot</pre>`+
	        `<strong>Welcome to transgram.</strong>\nYour transgram chat_id: <strong>${iChatId}</strong>\n`+
	        `Please setup this id on the transgram server to make me function properly.\n\n`+
	        `${sInstructions}\n\n` +
	        "Now, let's chat!"
	    const result = await API.send(payload, null, {chat_id: iChatId})
		if (!result.ok) {
			if (isRetry) {
				Logger.error("Failed to send instructions")
				return
			}
			Logger.warning("Could not send instructions. Will retry in 5 seconds...")
			setTimeout(()=>{TelegramMessenger.send_welcome_message(iChatId, sInstructions, true)}, 5000)
		}
	}

	/**
	 * Send a message to telegram
	 *
	 * @param   {String} sMessage the message
	 * @param   {Object} oArgs    optional arguments
	 *
	 * @returns {undefined}
	 */
	/*static async send(sMessage, oArgs={}) {
		API.send(sMessage, oArgs)
	}*/


	static async sendFile(sCookie, oFileUpload) {
		const cookie = Cookie.read(sCookie)
		
		let response = null
		
		const url = get_download_url(oFileUpload.name)

		switch (oFileUpload.type.split("/")[0]) {
		case "audio":
			response = await API.sendAudio({url}, cookie.room)
			if (!response.ok)
				response = await API.sendDocument({url}, cookie.room)
			break;
		case "video":
			response = await API.sendVideo({url}, cookie.room)
			if (!response.ok)
				response = await API.sendDocument({url}, cookie.room)
			break;
		case "image":
			response = await API.sendPhoto({url}, cookie.room)
			if (!response.ok)
				response = await API.sendDocument({url}, cookie.room)
			break;
		default:
			response = await API.sendDocument({url: get_download_url(oFileUpload.name)}, cookie.room)
			break;
		}
		if (response.error_code === 400) API.send(`Workaround for 400 Error: ${url}`, cookie.room)

	}

}

export default TelegramMessenger