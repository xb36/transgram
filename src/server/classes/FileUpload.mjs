//import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import path from "path"
import config from "../server_configuration.mjs"
import {exec} from "child_process"
import {get_download_url} from "../helpers/url_helper.mjs"

class FileUpload {

	constructor(oFile) {
		this.name = oFile.name
		this.type = oFile.type
		this.size = oFile.size
		this.url = oFile.url
		this.title = oFile.title
		this.performer = oFile.performer
		this.duration = oFile.duration
		this.width = oFile.width
		this.heigt = oFile.height
	}

	/**
	 * Parses information about an uploaded file using ffmpeg
	 * and linux system tools
	 *
	 * @param   {String} sFileName name of the file
	 *
	 * @returns {File}           new instance of a File object
	 */
	static async parse(sFileName){

		const runLinuxCommand = (sCMD) => {
			return new Promise((resolve, reject)=>{
				exec(sCMD, (e, stdo, stde)=>{
					resolve(stdo)
				})
			})
		}

		const ffmpeg_to_seconds = (string) => {
			let add = Number(string.split(".")[1]) > 50 ? 1 : 0  
			let times = string.split(".")[0].split(":")
			return Number(times[0]) * 3600 + Number(times[1]) * 60 + Number(times[2]) + add
		}

		const readMediaInfo = async (sFilePath) => {
			return runLinuxCommand(`ffmpeg -i ${sFilePath} 2>&1`)			
		}

		const getFileSize = async (sFilePath) => {
			const size = await runLinuxCommand(`ls -l ${sFilePath} | awk '{print $5}'`)
			return Number(size)
		}

		const getFileType = async (sFilePath) => {
			return (await runLinuxCommand(`file ${sFilePath} -bi | awk -F'[:;]' '{print $1}'`)).trim()
		}


		const sFilePath = path.join(config.uploads_directory, sFileName)

		const oFile = {
			name: sFileName,
			type: await getFileType(sFilePath),
			size: await getFileSize(sFilePath),
			url: get_download_url(sFileName)
		}

		// return unless threre is more info to fetch
		if (!["audio", "video", "image"].includes(oFile.type.split("/")[0]))
			return new FileUpload(oFile)


		const readDuration = async (sFFMPEGOutput) => {
			const durationPattern = /Duration: (\d{2}:\d{2}:\d{2}.\d{2})/
			const matches = sFFMPEGOutput.match(durationPattern)
			return matches ? ffmpeg_to_seconds(matches[1]) : undefined
		}

		const readTitle = async (sFFMPEGOutput) => {
			const titlePattern = /title\s+:\s+(.+)/
			const matches = sFFMPEGOutput.match(titlePattern)
			return matches ? matches[1] : undefined
		}


		const readDimension = async (sFFMPEGOutput) => {
			const dimensionPattern = /Stream.+Video.+\ (\d+x\d+)\b/
			const matches = sFFMPEGOutput.match(dimensionPattern)
			return matches ? matches[1].split("x").map(x=>Number(x)) : undefined
		}

		const readArtist = async (sFFMPEGOutput) => {
			const artistPattern = /artist\s+:\s+(.+)/
			const matches = sFFMPEGOutput.match(artistPattern)
			return matches ? matches[1] : undefined
		}

		const sMediaInfo = await readMediaInfo(sFilePath)

		if (oFile.type.split("/")[0] === "audio") {
			oFile.title = await readTitle(sMediaInfo)
			oFile.performer = await readArtist(sMediaInfo)
		}

		if (["audio", "video"].includes(oFile.type.split("/")[0])) {
			oFile.duration = await readDuration(sMediaInfo)
		}

		if (["image", "video"].includes(oFile.type.split("/")[0])) {
			const dim = await readDimension(sMediaInfo)
			if (dim && dim.length === 2) {
				oFile.width = dim[0]
				oFile.height = dim[1]
			}
		}

		return new FileUpload(oFile)
	}

	toCustomerMessage(sOwner, oAttr={}){
		return {...this, ...{...oAttr, ...{owner: sOwner}}}
	}
}

export default FileUpload