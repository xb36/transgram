import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import CustomerController from "./customer_controller.mjs"
import API from "../libs/TelegramAPI.mjs"
// import Telegram from "../messengers/telegram_messenger.mjs"

/**
 * @class
 * @hideconstructor
 */
class CommandController {

	/**
	 * Parses a telegram command
	 *
	 * @param   {Message} oMessage the message containing the command
	 *
	 * @returns {undefined}
	 */
	static async parse(oMessage) {
		Logger.info(oMessage)

		const args = oMessage.text.split(" ")

		switch (args[0]) {
		case "/thread":
		case "/topic":
			if (!oMessage.target) {
				API.send("This command requires a target")	
				return
			}
			if (oMessage.target === oMessage.chat_id) {
				API.send("Target must be a customer")
				return
			}
			const response = await API.createTopic(`${oMessage.target}: ${args.slice(1).join(" ")}`)
			if (!response.ok) {
				API.send(`Could not create topic: ${response.description}`)
				return
			}
			await API.send(oMessage.parentMessage.text, response.result.message_thread_id) // awaiting to prevent sending to #General
			CustomerController.updateTopic(oMessage.target, response.result.message_thread_id)
			.catch(error => {
				API.send(`Command failed: ${error}`)
				API.deleteTopic(response.result.message_thread_id)
			})
			break;
		}
	}
}

export default CommandController