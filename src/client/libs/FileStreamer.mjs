import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"
import {calcSha256} from "../helpers/hashing_helper.js"

class FileStreamer {

	constructor (oSocket, oFile, sCookie) {
		this.file = oFile
		this.socket = oSocket
		this.offset = 0
		this.offset_confirmed = 0 // for progress monitoring
		this.sequence = 0
		this.cookie = sCookie
	}

	start() {
		const reader = new FileReader()

		reader.onload = async()=>{
			const uint8Array = new Uint8Array(reader.result)
			const sha256sum = await calcSha256(uint8Array)

			const fileSize = uint8Array.length
			const fileType = this.file.type

			const fileName = this.file.name

			const cookie = this.cookie

			this.socket.emit("transfer_request", 
				{
					sha256sum,
					fileName, 
					fileSize,
					fileType,
					cookie
				}, 
				(response)=>{

					if (response.ok) {
						Logger.info("Transfer allowed")
						Logger.info(response.batchSize)

						while (this.offset < fileSize) {
							const batch = uint8Array.slice(this.offset, this.offset + response.batchSize)
							this.socket.timeout(5000).emit("batch_data", {sequence: this.sequence++, batch}, (timeout, success)=>{
								if (timeout) {
									// todo: handle batch upload timeout
								}
								this.offset_confirmed += response.batchSize
							})
							this.offset += response.batchSize
						}

						this.socket.emit("transfer_complete", (response)=>{
							if (response.ok) {
								this.onTransferComplete(response)
							} else {
								Logger.debug(response)
								this.onTranferError(response.error)
							}
						})

					} else {
						Logger.debug(response)
						this.onTranferError(response.error)
					}

				}
			)

		}

		reader.readAsArrayBuffer(this.file)
	}

	getProgress() {
		const progress = (this.offset_confirmed / this.file.size)
		Logger.info(progress)
		return progress
	}

	/**
	 * Event handler on completed transfer. Implement this outside
	 * of the class to handle the result
	 *
	 * @param   {Object} oResult the result of the transfer
	 *
	 * @returns {undefined}
	 */
	onTransferComplete(oResult){}

	/**
	 * Event handler on error. Implement this outside of the class to handle
	 * the error
	 *
	 * @param   {Object} oError the server error message
	 *
	 * @returns {undefined}
	 */
	onTranferError(oError){}
}

export default FileStreamer