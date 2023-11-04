import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import config from "../server_configuration.mjs"


/**
 * @class
 * @category Server
 */
class WebhookMessage {

	/**
	 * [constructor description]
	 *
	 * @param   {object} resource Object representing a telegram message
	 *
	 * @returns {WebhookMessage}          A new instance of WebhookMessage
	 */
	constructor(resource) {


		/**
		 * The telegram chat id
		 * (Used upon group/channel/forum creation)
		 *
		 * @type {undefined}
		 */
		this.chat_id = resource.my_chat_member?.chat.id || resource.message?.chat.id


		/**
		 * True if the message represents a forum creation
		 *
		 * @type {bool}
		 */
		this.isAForumCreation =
							resource.message?.migrate_from_chat_id
							&& resource.message.chat.type == "supergroup"

		/**
		 * True if the message represents a channel creation
		 *
		 * @type {bool}
		 */
		this.isAChannelCreation =resource.my_chat_member // this line makes sure that isAChannelCreation returnes undefined instead of false
							&& resource.my_chat_member?.chat.type == "channel"
							&& resource.my_chat_member.new_chat_member.user.username == config.bot_name
							&& resource.my_chat_member.new_chat_member.status == "administrator"


		/**
		 * True if the message represents a group creation
		 *
		 * @type {bool}
		 */
		this.isAGroupCreation =
							resource.message?.group_chat_created
							&& resource.message.chat.type == "group"







		const isATopicMessage = 
							resource.message?.is_topic_message
							&& resource.message.reply_to_message?.forum_topic_created
		const isAForumReply = 
							resource.message?.reply_to_message
							&& resource.message.chat.type == "supergroup"
							&& !resource.message.reply_to_message.is_topic_message

		const message = resource.message || resource.channel_post



		this.parentMessage = message?.reply_to_message ? {
			id: message.reply_to_message.message_id,
			text: message.reply_to_message.text
		} : undefined



		const topic_name = message?.reply_to_message?.forum_topic_created?.name.split(":")[0]
		const replies_to = message?.reply_to_message?.text?.slice(0, message.reply_to_message?.text.indexOf("\n"))
		/**
		 * The customer name / socket room name, if the message is intended to be sent to a customer
		 * (e.g. a group or channel reply to a bot message, or a topic message), else undefined
		 *
		 * @type {string}
		 */
		this.recipient = isATopicMessage ? topic_name : (isAForumReply ? undefined : replies_to)





		/**
		 * True if message is a chat command (starts with "/")
		 *
		 * @type {Boolean}
		 */
		this.isACommand = message?.text?.startsWith("/") ? true : undefined

		/**
		 * The target chat_id (for general commands) or customer (for customer commands)
		 * 
		 * @type {int | string}
		 */
		this.target = this.isACommand ? (replies_to ? replies_to : (topic_name ? topic_name : this.chat_id)) : undefined

		// just for the beauty of it...
		if (this.isACommand) this.recipient = undefined



		/**
		 * Message text
		 *
		 * @type {string}
		 */
		this.text = message?.text

		/**
		 * The time the message was sent
		 *
		 * @type {number}
		 */
		this.date = message?.date 

		/**
		 * The message id
		 *
		 * @type {number}
		 */
		this.id = message?.message_id

		/**
		 * The photo, if present
		 *
		 * @type {Object}
		 */
		this.photo = message?.photo?.pop() // last photo in array **usually** has the original size
		/**
		 * The video, if present
		 *
		 * @type {Object}
		 */
		this.video = message?.video
		/**
		 * The audio, if present
		 *
		 * @type {Object}
		 */
		this.audio = message?.audio
		/**
		 * The document, if present
		 *
		 * @type {Object}
		 */
		this.document = message?.document
	}

	/**
	 * Creates the object that will be delivered to the customer, dependant on the content of the message
	 *
	 * @returns {Object} the crafted message object
	 */
	async toCustomerMessage() {

		let message = {
			owner: "admin",
			sent_at: this.date,
			id: this.id,
			text: this.text,
			type: "text"
		}

		const file = this.audio || this.video || this.photo || this.document

		if (file) {
			const API = (await import("../libs/TelegramAPI.mjs")).default
			const fileUpload = await API.fetchFile(file)
			if (fileUpload) {
				Logger.warning(fileUpload)
				message = {...message, ...fileUpload}
				return message
			}
			return undefined
		} else {
			return message
		}


	}

}

export default WebhookMessage