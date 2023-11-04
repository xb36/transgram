import config from "../server_configuration.mjs"
import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"

import SocketListener from "../listeners/socket_listener.mjs"
import Cookie from "../controllers/cookie_controller.mjs"

/**
 * @class
 * @hideconstructor
 */
class CustomerMessenger {

	/**
	 * Emits a cookie object (as JSON) to the customer
	 *
	 * @param   {String} sName   customer name
	 * @param   {Object} oCookie object representing a cookie
	 *
	 * @returns {undefined}
	 */
	static async setCookie (sName, oCookie) {
		Logger.debug(`Sending cookie to ${sName}`)
		const socket = await SocketListener.get(sName)
		if (socket) socket.emit("setcookie", Cookie.pack(oCookie))
	}


	static async getCookie (sName) {
		Logger.debug(`Requesting cookie from ${sName}`)
		return new Promise(async (resolve, reject)=>{
			const socket = await SocketListener.get(sName)
			if (socket) socket.timeout(5000).emit("getcookie", (error, cookie)=>{
				if (error) reject(error)
				resolve(Cookie.read(cookie))
			})
			else reject("Wrong target or target is offline")
		})
	}

	/**
	 * Sends a message to the customer chat
	 *
	 * @param   {Object} oMessage the message
	 *
	 * @returns {undefined}
	 */
	static async sendMessage (oMessage) {
		Logger.debug(`Sending message to ${oMessage.recipient}`)

		const message = await oMessage.toCustomerMessage()

		if (!message) {
			Logger.warning("Not delivering empty message")
			return
		}

		const socket = await SocketListener.get(oMessage.recipient)
		if (socket) socket.emit("message", message)
	}

}

export default CustomerMessenger