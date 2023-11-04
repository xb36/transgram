import config from "../client_configuration"
import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"

class CookieController {

	static EXPIRATION_TIME = config.cookie_expiration_time || 6

	static get() {
		return document.cookie.split("=")[1]
	}

	static object() {
		try {
			return JSON.parse(this.get())
		} catch (error) {
			Logger.error(error)
			return {}
		}
	}

	static set(data) {
		Logger.debug("setting cookie")
		const expiration_date  = this._getExpirationDate()
		document.cookie=`transgram_data=${data};`+
				`expires=${expiration_date};`+
				`SameSite=None;`+ /* will be required for widget apps in near future */
				`Secure=true;`+
				`path=/`
	}

	static revoke() {
		document.cookie=`transgram_data=;`+
				`expires=Thu, 18 Dec 2013 12:00:00 UTC;`+
				`path=/`
	}

	static _getExpirationDate = () => {
		Date.prototype.addHours = function(h) {
			this.setTime(this.getTime() + (h*60*60*1000));
			return this;
		}
		return new Date().addHours(this.EXPIRATION_TIME)
	}
}

export default CookieController