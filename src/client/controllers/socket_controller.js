import config from "../client_configuration.js"
import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"
import Storage from "./storage_controller.js"
import { io as IO } from "socket.io-client"
import Cookie from "./cookie_controller"

class SocketController {

	static socket = null


	static get() {
		return this.socket
	}

	static connect(state){
		this._connect()

		const token = Storage.getConnectionToken()
		let oCon = null
		if (token) {
			oCon = {
				type: "token",
				token
			}
		} else {
			oCon = {
				type: "name",
				name: config.customer_name
			}
		}
		Logger.debug(`Registering to socket server using:`)
		Logger.debug(oCon)
		this.socket.emit("register_", oCon, (response)=>{			
			Logger.debug(response)
			if (!response.ok) {
				Logger.debug("Invalid response")
				if (response.error == "Invalid token") {
					Logger.debug("deleting (old) token")
					Storage.removeConnectionToken()
					SocketController.connect(state)
				}
				state.isConnected.value = false
				return
			} else {
				Logger.debug("Connected successfully")
				state.isConnected.value = true
				// set token if this is a new connection
				if (response.token) {
					Storage.setConnectionToken(response.token)			
				}
			}
		})
	}



	/**
	 * Sends a message and returns message data
	 * The returned data includes the message id, date and text
	 *
	 * @param   {String} sText The sent message
	 *
	 * @returns {undefined}
	 */
	static sendMessage (sText) {
		this._connect()
		const data = {
			cookie: Cookie.get(),
			message: sText
		}
		return new Promise((resolve, reject)=>{
			this.socket.timeout(5000).emit("message", data, (error, response)=> {
				if (error)
					reject(error)
				else if (!response.ok)
					reject("Message could not be delivered to the backend server")
				else
					resolve(response)
			})
		})
	}


	static handleMessage (data, cb) {
		SocketController.onMessage(data)
		if (typeof cb === "function") cb()
	}



	static sendCookie (cb) {
		Logger.debug("Cookie requested")
		cb(Cookie.get())
	}

	static setCookie(cookie) {
		Logger.debug("Cookie received")
		Cookie.set(cookie)
	}

	static _init () {
		Logger.debug("Initializing socket..")
		Logger.debug(`config.transgram_host_url: ${config.transgram_host_url}`)
		Logger.debug(`location.host: ${location.host}`)
		const url = process.env.NODE_ENV == "production" 
			? `wss://${config.transgram_host || location.host}`
			: `ws://${config.transgram_host || location.host}`
		this.socket = IO(url, {
			autoConnect: false,
			closeOnBeforeunload: false
		})
		this.socket.on('connect_error', err => Logger.error(err))
		this.socket.on('connect_failed', err => Logger.error(err))
	}

	static _connect() {
		if (!this.socket)
			this._init()
		if (!this.socket.connected) {
			Logger.debug("Connecting socket and setting up listeners..")
			this.socket.connect()
			this.socket.on("message", this.handleMessage)
			this.socket.on("getcookie", this.sendCookie)
			this.socket.on("setcookie", this.setCookie)
		}
	}
}

export default SocketController