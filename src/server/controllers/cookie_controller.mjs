import Cryptor from "../libs/Cryptor.mjs"
import config from "../server_configuration.mjs"
import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"

class CookieController {
	/**
	 * Generates n object that represents the customer cookie
	 *
	 * @param   {String} sName customer name
	 *
	 * @returns {object}       the cookie object
	 */
	static generate(sName) {
		Logger.debug(`Generating new Cookie for ${sName}`)
		return {name: sName, room: sName}
	}

	/**
	 * reads the stringified cookie object
	 *
	 * @param   {String} sCookie stringified JSON
	 *
	 * @returns {Object}         object representing a cookie
	 */
	static read(sCookie) {
		Logger.debug(sCookie)
		try {
			return Cryptor.de(JSON.parse(sCookie))
		} catch (error) {
			Logger.error(error)
			return {}
		}
	}

	static pack (data) {
		Logger.debug(`Packing cookie for transmission..`)
		data = Cryptor.en(data) 
		return JSON.stringify(data)
	}
}

export default CookieController