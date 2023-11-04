import config from "../server_configuration.mjs"
import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import fs from "node:fs"
import https from "https"
import Cryptor from "./Cryptor.mjs"
import path from "path"
//import {get_download_url} from "../helpers/url_helper.mjs"
import FileUpload from "../classes/FileUpload.mjs"

/**
 * @class
 * @hideconstructor
 */
class TelegramAPI {
	static BASE_URL = 'https://api.telegram.org/bot'
	static HEADERS = {
	            Accept: "application/json",
	            "Content-Type": "application/json;charset=UTF-8",
	        }
	static DEFAULT_OPTIONS = {
		method: "POST",
		headers: this.HEADERS
	}
	static _URL(path) {
		return this.BASE_URL + process.env.TELEGRAM_API_TOKEN + "/" + path
	}

	static send(message, topic, parameter={}) {

		const url = this._URL("sendMessage")

		const body =  {...{chat_id: config.transgram_chat_id, 
							text: message, 
							message_thread_id: topic, 
							parse_mode: "html"}, 
							...parameter}

	    const options = {
	        body: JSON.stringify(body)
	    };
	    
	    return this._transmit(url, options)
	}

	static edit(parameter={}) {

		const url = this._URL("editMessageText")
		const body = {...{chat_id: config.transgram_chat_id, parse_mode: "html"}, ...parameter}

		Logger.debug(`TelegramAPI.edit: Going to edit message #${parameter.message_id}`)
		Logger.error(body)

		const options = {
			body: JSON.stringify(body)
		}

		return this._transmit(url, options)
	}

	static createTopic(name, parameter={}, chat_id=config.transgram_chat_id) {
		Logger.debug(`TelegramAPI.createTopic`)

		const url = this._URL("createForumTopic")

		const options = {
			body: JSON.stringify({...{
				"chat_id": chat_id,
				"name": name
			}, ...parameter})
		}

		return this._transmit(url, options)		
	}

	static editTopic(topic_id, parameter, chat_id=config.transgram_chat_id) {
		Logger.debug(`Edit topic #${topic_id}`)

		const url = this._URL("editForumTopic")

		const options = {
			body: JSON.stringify({...{
				"chat_id": chat_id,
				"message_thread_id": topic_id
			}, ...parameter})
		}

		return this._transmit(url, options)
	}

	static closeTopic(topic_id, chat_id=config.transgram_chat_id) {
		Logger.debug(`Closing topic #${topic_id}`)

		const url = this._URL("closeForumTopic")

		const options = {
			body: JSON.stringify({
				"chat_id": chat_id,
				"message_thread_id": topic_id
			})
		}

		return this._transmit(url, options)
	}

	static deleteTopic(iTopicId, iChatId=config.transgram_chat_id){
		Logger.debug(`Deleting topic #${iTopicId}`)

		const url = this._URL("deleteForumTopic")

		const options = {
			body: JSON.stringify({
				"chat_id": iChatId,
				"message_thread_id": iTopicId
			})

		}
		return this._transmit(url, options)
	}

    
    static sendVideo (doc, topic, parameter={}, chat_id=config.transgram_chat_id){
    	const url = this._URL("sendVideo")

    	const options = {
    		body: JSON.stringify({...{
    			"chat_id": chat_id,
    			"video": doc.url,
    			message_thread_id: topic
    		}, ...parameter})
    	}

    	Logger.debug(`Transmitting: ${doc.url}`)
    	return this._transmit(url, options)
    }

    static sendAudio (doc, topic, parameter={}, chat_id=config.transgram_chat_id){
    	const url = this._URL("sendAudio")

    	const options = {
    		body: JSON.stringify({...{
    			"chat_id": chat_id,
    			"audio": doc.url,
    			message_thread_id: topic
    		}, ...parameter})
    	}

    	Logger.debug(`Transmitting: ${doc.url}`)
    	return this._transmit(url, options)
    }

    static sendPhoto (doc, topic, parameter={}, chat_id=config.transgram_chat_id) {
    	const url = this._URL("sendPhoto")

    	const options = {
    		body: JSON.stringify({...{
    			"chat_id": chat_id,
    			"photo": doc.url,
    			message_thread_id: topic
    		}, ...parameter})
    	}

    	Logger.debug(`Transmitting: ${doc.url}`)
    	return this._transmit(url, options)    	
    }
    
    static sendDocument (doc, topic, parameter={}, chat_id=config.transgram_chat_id) {
    	const url = this._URL("sendDocument")

    	const options = {
    		body: JSON.stringify({...{
    			"chat_id": chat_id,
    			"document": doc.url,
    			message_thread_id: topic
    		}, ...parameter})
    	}

    	Logger.debug(`Transmitting: ${doc.url}`)
    	return this._transmit(url, options)  
    } 

    static async getFile(file_id) {
    	const url = this._URL("getFile")+`?file_id=${file_id}`
    	const options = {
    		method: "GET"
    	}
    	return this._transmit(url, options)
    }

    /* downloads the file to local uploads path and returns FileUpload object */
	static async fetchFile(file) {
		Logger.debug("Fetching file from Telegram server")
		// get file path on TG Server
		let response = await this.getFile(file.file_id)
		if (!response.ok) {
			Logger.error(`Could not fetch file: (${response.error_code}) ${response.description}`)
			return
		}
		Logger.debug(response)
		// fetch file
		const url = `https://api.telegram.org/file/bot`+
			`${process.env.TELEGRAM_API_TOKEN}/${response.result.file_path}`
		Logger.debug(`fetching file from ${url}`)
		
		const buffer = await new Promise((resolve, reject) => {
			https.get(url, (res) => {
				const body = []
				res.on("data", chunk => {
					body.push(chunk)
				})
				.on("end", () => {
					resolve(Buffer.concat(body))
				})
			})
		})

		if (!buffer.length) {
			Logger.error("Buffer is empty")
			return
		}

		// calculate sha256
		const sha = await Cryptor.sha256(buffer)

		// save file to uploads directory
		const filename = sha.slice(0, 16) + `-${url.split("/").pop()}`
		const pathname = path.join(
			config.uploads_directory,
			 filename)
		Logger.debug(`Going to write file: ${pathname}`)
		fs.writeFileSync(pathname, buffer)

		return await FileUpload.parse(filename)

	}

	static _transmit(url, options) {

		Logger.debug("Sending Request...")

		options = {...this.DEFAULT_OPTIONS, ...options}

		Logger.debug(`Transmit ${JSON.stringify(options)} to ${url}`)

		return fetch(url, options)
	        .then((response) => {
	            return response.json()
	        })
	        .then((data) => {
	          	Logger.debug("Response data from API:")
	            Logger.debug(data)
	            return data
	        }
	    );
	}

}

export default TelegramAPI