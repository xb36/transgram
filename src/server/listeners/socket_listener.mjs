import Cryptor from "../libs/Cryptor.mjs"
import config from "../server_configuration.mjs"

/**
 * @class
 * @hideconstructor
 */
class SocketListener {

	static IO = null

	/**
	 * Contains sockets with active connections. The key is 
	 * the hashed name provided by the client when 
	 * emitting "new_"
	 *
	 * @type {Object}
	 */
	static _connections = {}
	/**
	 * Disconnected sockets that may return in time
	 *
	 * @type {Object}
	 */
	static _cache = {}

	/**
	 * Forget ("disconnect") sockets after this many seconds 
	 *
	 * @type {number}
	 */
	static _caching_time = config.preserve_chat_seconds

	/**
	 * optional salt for the hash
	 *
	 * @type {string}
	 */
	static _salt = ""

	/**
	 * Length of randomly generated session string
	 * 
	 * @type {number}
	 */
	static _session_string_length = 6

	/**
	 * contains custom events to listen for, will be set by '.on()'
	 * [The events and listeners are again delivered as an array,
	 * where index 0 holds the event and index 1 the handler]
	 *
	 * @type {Array}
	 */
	static _event_callbacks = []

	/**
	 * Listen on socket.io connection
	 *
	 * @param   {Object} oServer socket.io Server
	 *
	 * @returns {undefined}
	 */
	static async listen (oServer) {
		if (this.IO) throw new Error ("Can only listen to one socket server")
		if (oServer.constructor.name !== "Server") throw new Error ("Argument 1 must be of type 'Server'")
		this.IO = oServer
		this.IO.on('connection', this._setup)
	}


	/**
	 * Initialize listener for new socket
	 *
	 * @param   {Object} oSocket connecting socket
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	static async _setup (oSocket) {
		oSocket.on("register_", SocketListener._handleRegistration)
		oSocket.on("disconnect", SocketListener._handleDisconnect)
		SocketListener._event_callbacks.forEach(aEvent => {
			oSocket.on(aEvent[0], aEvent[1])
		})
	}


	/**
	 * register socket event to listen for on connection
	 * [Must be called before listen()]
	 *
	 * @param   {String}   sEvent the action to listen for
	 * @param   {Function} cb     event handler function
	 *
	 * @returns {undefined}
	 */
	static on (sEvent, cb) {
		if (typeof sEvent !== 'string' 
				|| sEvent.length === 0
				|| typeof cb !== 'function') {
			throw new Error ("Wrong paramteres for SocketListener.on event")
		}
		if (this.IO) {
			throw new Error ("SocketListener events must be registered before calling .listen().")
		}

		this._event_callbacks.push([sEvent, cb])
	}


	/**
	 * Get the socket that belongs to the given name
	 *
	 * @param   {String} sName associated name
	 *
	 * @returns {object}       the socket
	 */
	static async get (sName) {
		const hash = await Cryptor.hash(sName + SocketListener._salt)
		return SocketListener._connections[hash]
	}


	/**
	 * Print out the current state
	 * Mainly used for debugging
	 *
	 * @returns {undefined}
	 */
	static async report () {
		console.log({
			count: Object.keys(SocketListener._connections).length,
			cached: Object.keys(SocketListener._cache).length
		})
	}


	/**
	 * Registeres a new connection to the listener
	 *
	 * @param   {Object}   oCon  connection object
	 * @param   {Function} cb    socket callback
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	static async _handleRegistration (oCon, cb) {
		switch (oCon.type) {
		case "name":
			SocketListener._registerByName(this, oCon.name, cb)
			break
		case "token":
			SocketListener._registerByToken(this, oCon.token, cb)
			break
		default:
			SocketListener._emitError(
				"Wrong connection object", cb
			)
		}

	}


	static async _registerByName(oSocket, sName, cb) {
		if (typeof cb !== 'function') return
		if (typeof sName !== 'string') {
			SocketListener._emitError(
				`First parameter must be of type 'string', ${typeof sName} given`, cb)
			return
		}
		if (sName.length === 0) {
			SocketListener._emitError("Name must not be empty", cb)
			return
		}
		sName += `#${SocketListener._generateSessionString()}`
		const hashed_name = await Cryptor.hash(sName + SocketListener._salt)
		// should not happen, as name is "salted":
		if (SocketListener._connections[hashed_name]) {
			SocketListener._emitError("Name is already registered", cb)
			return
		}
		// should not happen, as name is "salted":
		if (await SocketListener._isInCache(hashed_name)) {
			SocketListener._emitError("You must use your token to return a session" ,cb)
			return
		}
		SocketListener._connections[hashed_name] = oSocket
		cb({
			ok: true,
			token: hashed_name		})
		SocketListener.onRegister(sName, hashed_name)
	}


	static async _registerByToken(oSocket, sToken, cb) {
		if (!await SocketListener._isInCache(sToken)) {
			SocketListener._emitError("Invalid token", cb)
			return
		}
		SocketListener._connections[sToken] = oSocket
		if (typeof cb === "function") cb({ok: true})
		SocketListener.onReturn(sToken)
	}


	/**
	 * Save returning connection to _connections
	 *
	 * @param   {String}   sToken token provided on registration
	 * @param   {Function} cb     optional callback to client
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	/*
	static async _handleReturn(socket, sToken, cb) {
		SocketListener._connections[sToken] = socket
		if (typeof cb === "function") cb({ok: true})
		SocketListener.onReturn(sToken)
	}
	*/

	static _generateSessionString () {
		const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		let str = ""
		for (var i = SocketListener._session_string_length - 1; i >= 0; i--) {
			str += alphabet[Math.floor(Math.random()*alphabet.length)]
		}
		return str
	}

	/**
	 * Deletes disconnected socket from connections and moves key to cache
	 * schedules deletion after defined time if connection is not 
	 * re-established within _caching_time
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	static async _handleDisconnect () {
		Object.keys(SocketListener._connections).every (key => {
			if (SocketListener._connections[key] === this) {
				const rand = Math.random() // prevents race conditions
				SocketListener._cache[key+rand] = true
				delete SocketListener._connections[key]
				setTimeout(()=>{
						delete SocketListener._cache[key+rand]
						if (!SocketListener._connections[key])
							SocketListener.onUnregister(key)
					},
					SocketListener._caching_time * 1000
				)
				return false // break;
			}
			return true // continue;
		})
	}


	/**
	 * Checks if the given identifier (name or token) is present in
	 * cache. Cached connection tokens have an added random salt to
	 * prevent racing conditions when deleting cached entries
	 *
	 * @param   {String}  sIdentifier name or token provided by customer
	 *
	 * @returns {Boolean}             true if identifier was found
	 *
	 * @private
	 */
	static async _isInCache(sIdentifier) {
		let found = false
		Object.keys(this._cache).forEach(key => {
			if (key.startsWith(sIdentifier)) {
				found = true
			}
		})
		return found
	}

	/**
	 * Emits an object containing the error message
	 *
	 * @param   {String}   sError Error message
	 * @param   {Function} cb     socket callback function
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	static async _emitError (sError, cb) {
		if (typeof cb !== "function") return
		cb({
			ok: false,
			error: sError
		})
	}

	// event handlers to be used outside of this class
	static async onRegister(){}
	static async onReturn(){}
	static async onUnregister(){}
}

export default SocketListener