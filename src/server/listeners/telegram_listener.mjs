import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import express from "express"
import WebhookMessage from "../classes/WebhookMessage.mjs"

/**
 * @class
 * @hideconstructor
 */
class TelegramListener {

	/**
	 * listens for incoming telegram bot messages on sPath
	 *
	 * @param   {Object} oExpress express app
	 * @param   {String} sPath    hook path
	 *
	 * @returns {undefined}
	 */
	static async listen (oExpress, sPath) {
		
		oExpress.use(express.json())

		oExpress.post(sPath, (req, res) => {

			// console.log(req.body)
			
			const message = new WebhookMessage(req.body)
			//Logger.info(message)

				 if (message.isACommand)			TelegramListener.onCommand(message)
			else if (message.isAGroupCreation) 		TelegramListener.onGroupCreation(message)
			else if (message.isAChannelCreation) 	TelegramListener.onChannelCreation(message)
			else if (message.isAForumCreation) 		TelegramListener.onForumCreation(message)
			else if (message.recipient)				TelegramListener.onServiceMessage(message)

			res.statusCode = 200;
    		res.end();
		})
	}


	static async onCommand(message){}
	static async onGroupCreation(message){}
	static async onChannelCreation(message){}
	static async onForumCreation(message){}
	static async onServiceMessage(message){}

}

export default TelegramListener