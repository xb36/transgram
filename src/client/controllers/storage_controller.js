import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"

class StorageController {

	static MESSAGES_KEY = "tg_msg"
	static SOCKET_TOKEN_KEY = "tg_sock_token"
	static LAST_USAGE_KEY = "tg_last"
	static CHAT_OPEN_STATE_KEY = "tg_open"
	static INPUT_VALUE_KEY = "tg_inp_val"
	static SCROLL_HEIGHT_KEY = "tg_scroll"
	static AUTO_RESPONSE_KEY = "tg_auto"

	static setLastUsageTimestamp(timestamp) {
		window.localStorage.setItem(this.LAST_USAGE_KEY, Number(timestamp))
	}
	static getLastUsageTimestamp() {
		const last = window.localStorage.getItem(this.LAST_USAGE_KEY)
		if (last) return Number(last)
		else return null 
	}

	static getConnectionToken() {
		return window.localStorage.getItem(this.SOCKET_TOKEN_KEY)
	}
	static setConnectionToken(token) {
		window.localStorage.setItem(this.SOCKET_TOKEN_KEY, token)
	}
	static removeConnectionToken() {
		window.localStorage.removeItem(this.SOCKET_TOKEN_KEY)
	}

	static getMessages() {
		return window.localStorage.getItem(this.MESSAGES_KEY) 
		? JSON.parse(window.localStorage.getItem(this.MESSAGES_KEY))
		: []
	}
	static setMessages(aMessages) {
		window.localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(aMessages))
	}
	static removeMessages() {
		window.localStorage.removeItem(this.MESSAGES_KEY)
	}

	static getChatOpenState() {
		if (window.localStorage.getItem(this.CHAT_OPEN_STATE_KEY) == "true")
			return true
		return false
	}
	static setChatOpenState(bState) {
		window.localStorage.setItem(this.CHAT_OPEN_STATE_KEY, bState)
	}
	static removeChatOpenState() {
		window.localStorage.removeItem(this.CHAT_OPEN_STATE_KEY)
	}	

	static getInputValue() {
		return window.localStorage.getItem(this.INPUT_VALUE_KEY)
	}
	static setInputValue(sValue) {
		window.localStorage.setItem(this.INPUT_VALUE_KEY, sValue)
	}
	static removeInputValue() {
		window.localStorage.removeItem(this.INPUT_VALUE_KEY)
	}	

	static setScrollHeight(iHeight) {
		window.localStorage.setItem(this.SCROLL_HEIGHT_KEY, iHeight)
	}
	static getScrollHeight() {
		const height = window.localStorage.getItem(this.SCROLL_HEIGHT_KEY)
		if (height !== null)
			return Number(height)
		else return null
	}
	static removeScrollHeight() {
		window.localStorage.removeItem(this.SCROLL_HEIGHT_KEY)
	}

	static setAutoResponseSent(bSent) {
		window.localStorage.setItem(this.AUTO_RESPONSE_KEY, bSent)
	}
	static getAutoResponseSent() {
		return window.localStorage.getItem(this.AUTO_RESPONSE_KEY) === "true"
	}
	static removeAutoResponseSent() {
		window.localStorage.removeItem(this.AUTO_RESPONSE_KEY)
	}



/*
	static PATIENT_STATE_KEY = "TRANSGRAM_PATIENT_STATE"
	static CHAT_SCROLL_KEY = "TRANSGRAM_CHAT_SCROLL"
	static MAX_AWAY_TIME_KEY = "TRANSGRAM_MAX_AWAY_TIME"

	static deleteMessages() {
		Logger.debug("Deleting saved messages")
		window.localStorage.setItem(this.MESSAGES_KEY, [])
	}
	static getPatientState() {
		if (window.localStorage.getItem(this.PATIENT_STATE_KEY) == "true")
			return true
		return false	
	}
	static setPatientState(state) {
		window.localStorage.setItem(this.PATIENT_STATE_KEY, state)
	}
	static getMaxAwayTime() {
		return window.localStorage.getItem(this.MAX_AWAY_TIME_KEY) || -1
	}
	static setMaxAwayTime(seconds) {
		window.localStorage.setItem(this.MAX_AWAY_TIME_KEY, seconds)
	}
*/
}

export default StorageController