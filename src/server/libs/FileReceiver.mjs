import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import checkDiskSpace from 'check-disk-space'
import path from "path"
import fs from "node:fs"
import config from "../server_configuration.mjs"
import Cryptor from "./Cryptor.mjs"

class FileReceiver {

	/**
	 * holds the reference to running transfers
	 *
	 * @type {Array}
	 */
	static running_instances = []

	/**
	 * Class constructor
	 *
	 * @param   {Object} oSocket the socket requesting the file transfer
	 * @param   {Object} oData   the data object passed to handleTransferRequest
	 *
	 * @returns {FileReceiver}	new instance of FileReceiver
	 */
	constructor(oSocket, oData) {
		this.socket = oSocket
		this.data = oData
		this.filename = oData.sha256sum
			.slice(0, 16).
			concat(`-${oData.fileName
				// replace all whitespace characters with underscores (_)
				.replace(/ /g, "_")}`
			) 
		this.filepath = path.join(config.uploads_directory, this.filename)
		this.heartbeatTimeout = null
		this.receivedBatches = new Map()

		Logger.info(`Writing file to ${this.filepath}`)
		this.stream = fs.createWriteStream(this.filepath)
		this.stream.on("error", (err)=>{
			Logger.error(`Error creating write stream: ${err}`)
		})

		// Save the bound event handler functions as instance properties
		this.handleBatchData = this._handleBatchData.bind(this);
		this.handleTransferComplete = this._handleTransferComplete.bind(this);

		// Register the event listeners using the instance properties
		this.socket.on("batch_data", this.handleBatchData);
		this.socket.on("transfer_complete", this.handleTransferComplete);

		this._startHeartbeat()
	}

	/**
	 * Saves incoming batch data
	 *
	 * @param   {int}   options.sequence    The sequence assigned to the batch
	 * @param   {binary}   options.batch    sliced Uint8Array containing the batch
	 * @param   {Function} cb                socket event callback
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	_handleBatchData ({sequence, batch}, cb) {
		//Logger.debug(`Received batch data (Seq: ${sequence})`)

		this.receivedBatches.set(sequence, batch)
		this._processBatchQueue(sequence)
		cb(true)

		this._resetHeartbeat()
	}

	/**
	 * Writes the saved batches sequentially to file
	 *
	 * @param {int} iStart batch sequence number to start processing at
	 * 
	 * @returns {undefined}
	 *
	 * @private
	 */
	_processBatchQueue(iStart) {
		let nextSequence = iStart;
		let nextBatch = this.receivedBatches.get(nextSequence)

		while (nextBatch) {
			this.stream.write(nextBatch)
			//Logger.debug(`Processed batch #${nextSequence}`)

			this.receivedBatches.delete(nextSequence)
			nextSequence++
			nextBatch = this.receivedBatches.get(nextSequence)
		}
	}

	/**
	 * Event handler for socket event "transfer_complete".
	 * Checks for file integrity and calls onTransferComplete event
	 * 
	 * @param   {Function} cb        socket event callback
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	async _handleTransferComplete(cb) {
		Logger.info("Transfer completed successfully")
		// crossing fingers here that the batch queue was emtied before calculating the hash
		const check = await this._checkFileIntegrity()
		if (check) {
			FileReceiver.onTransferComplete({
				ok: true,
				name: this.filename,
				cookie: this.data.cookie
			}, cb)
		} else {
			FileReceiver.onTransferComplete({
				ok: false,
				code: 409,
				message: "File integrity check failed"
			}, cb)
			this._handleError()
		}
		this._runCleanup()
	}

	async _checkFileIntegrity() {
		Logger.info("Checking file integrity")
		const check = await Cryptor.hashFile(this.filepath)
		return check == this.data.sha256sum
	}

	/**
	 * Removes event listeners, heartbeat timeout and closes the stream
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	_runCleanup() {
		Logger.debug("running cleanup")
		if (this.stream) {
			if (this.receivedBatches.size === 0) {
				this.stream.end()
			} else {
				this.stream.on("finish", ()=>{
					this._runCleanup()
				})
			}
		}
		clearTimeout(this.heartbeatTimeout)

		this.socket.off("batch_data", this.handleBatchData)
		this.socket.off("transfer_complete", this.handleTransferComplete)

		// todo: remove instance from running_instances
	}


	_startHeartbeat() {
		//Logger.debug("Starting heartbeat")
		this.heartbeatTimeout = setTimeout(()=>{
			Logger.warning("Socket disconnected during transfer")
			this._handleError()
		}, config.upload_timeout_ms)
	}

	_handleError() {
		this.stream.end(()=>{
			Logger.debug("Deleting unfinished file")
			if (fs.existsSync(this.filepath))
				fs.unlinkSync(this.filepath)
		})
		this._runCleanup()
	}

	_resetHeartbeat() {
		//Logger.debug("Resetting heartbeat")
		clearTimeout(this.heartbeatTimeout)
		this._startHeartbeat()
	}

	/**
	 * socket.io listener for transfer_request events. Checks for validity
	 * and creates a new instance of FileReceiver to handle the upload.
	 * Also, passes an object to the callback containing state of authorization,
	 * and if authorized, the expected batch size (otherwise it contains an error message).
	 *
	 * @param   {Object}   oData Object containing fileName, fileSize and fileType and the sha256sum of the file
	 * @param   {Function} cb    socket event callback
	 *
	 * @returns {undefined}
	 */
	static async handleTransferRequest(oData, cb) {
		Logger.debug("incoming transfer request")
		try {
			await FileReceiver._authorizeRequest(oData)

			FileReceiver.running_instances.push(new FileReceiver(this, oData))

			cb({
				ok: true,
				batchSize: config.file_upload_batch_size
			})
		} catch (error) {
			error = JSON.parse(error.message)
			cb({
				ok: false,
				error
			})
		}
	}

	/**
	 * authorizing incoming transfer requests. Throws an error
	 * if transfer cannot be authorized
	 *
	 * @param   {Object} oData the data passed with the transfer_request
	 *
	 * @returns {undefined}
	 *
	 * @private
	 */
	static async _authorizeRequest(oData) {
		Logger.debug("validating request")

		const file_size = oData.fileSize

		const free_space = await FileReceiver.__getRemainingSpace()
		Logger.debug(`Free space: ${free_space}`)
		if (free_space < file_size) {
			const error = JSON.stringify({
				code: 507,
				message: "The uploaded file exceeds the server disk capacity"
			})
			throw new Error(error)
		}

		const allowed_size = await FileReceiver.__getAllowedSizeFor(oData.fileType)
		Logger.debug(`Allowed size: ${allowed_size}`)
		if (allowed_size < file_size) {
			const error = JSON.stringify({
				code: 413,
				message:`${config.file_too_large_error} ${allowed_size / 1024 / 1024}MB`,
				max_size: allowed_size
			})
			throw new Error(error)		
		}

		// todo: file already exists
	}

	/**
	 * Checks free disk space
	 *
	 * @returns {number} free disk space in bytes
	 *
	 * @private
	 */
	static async __getRemainingSpace() {
		const upload_path = config.uploads_directory
		const disk = await checkDiskSpace(upload_path)
		return disk.free
	}

	/**
	 * Retrieves the allowed upload size for the given type 
	 * from the configuration file
	 *
	 * @param   {string} type the file type to check
	 *
	 * @returns {number}      allowed filesize in bytes
	 *
	 * @private
	 */
	static async __getAllowedSizeFor(type) {
		type = type.split("/")[0]
		let size = config.allowed_file_sizes_mb[type] || config.allowed_file_sizes_mb["default"]
		return size * 1024 * 1024
	}


	/**
	 * Event handler for completed transfer. It is meant to be implemented outside
	 * of this class to handle completed transfers.
	 * Note: Even when a transfer is complete, it can sstill fail (e.g. when the
	 * file integrity check fails)
	 *
	 * @param   {Object}   oResult object containing the result
	 * @param   {Function} cb      socket event callback for "transfer_complete"
	 *
	 * @returns {undefined}
	 */
	static onTransferComplete(oResult, cb){}



}

export default FileReceiver