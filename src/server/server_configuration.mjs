import { fileURLToPath } from 'url';
import { dirname } from 'path';

const server_configuration = {
	allow_broadcasting: false, /* Not implemented yet - anyway. leave disabled unless you really need it. Bad things can happen */
	// todo: let the client (securely!) determin the chat ID
	transgram_chat_id: process.env.NODE_ENV === "production" ? -1001953499908 : -1001815140021,
	message_transmission_error: "Something went wrong. Your message could not be delivered. Please try again in a moment.",
	file_integrity_check_error: "The integrity of the uploaded file could not be validated",
	// path on disk - make sure it exists and that node has permissions to read it if you change this
	uploads_directory: dirname(fileURLToPath(import.meta.url)) + "/../../public/uploads/",
	// path to use for express.static to serve the file
	uploads_path: "/uploads",
	// after how many milliseconds we assume the client disconnected
	upload_timeout_ms: 5000,
	// MUST have "default" key
	// images are limited to 5MB by telegram
	// other files are limited to 20MB
	allowed_file_sizes_mb: {
		"image": 5,
		"default": 20
	},
	file_upload_batch_size: 32 * 1024,
	file_too_large_error: "File is too big. Max allowed size for this type is",
	// stay connected this many seconds (e.g. page reload, app closing,...)
	preserve_chat_seconds: process.env.NODE_ENV === "production" ? 60 : 3,
	//deberta_xsmall_path: "/home/git/python3.10/bart-large-mnli/src$ python3.10 deberta-xsmall.py",
	//python_command: "python3.10",
	/**
	 * username of the transgram bot.
	 * Required to classify messages. This may become 
	 * obsolete in the future but is required at the moment.
	 *
	 * @type {String}
	 */
	bot_name: "transgram_dev_bot",

}

export default server_configuration 