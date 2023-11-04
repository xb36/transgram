import config from "../client_configuration.js"
import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"

/**
 * @class
 * @category Client
 */
class Message {
	constructor(oAttr={}) 
	{
		oAttr = {...{
			owner: "customer",
			type: "text",
			date: (+ new Date()) / 1000 
		}, ...oAttr}

		this.owner = oAttr.owner 
		this.type = oAttr.type 
		this.text = oAttr.text 
		this.date = oAttr.date 
		this.id = oAttr.id 
		this.url = oAttr.url 
		this.size = oAttr.size 
		this.duration = oAttr.duration 
		this.name = oAttr.name 
	}

	static system (sMessage) {
		return new Message({
			owner: "system",
			text: sMessage
		})
	}
}

export default Message