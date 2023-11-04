import config from "../client_configuration"
//import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"

export const pretty_filesize = (bytes, rounded=false) => {
	const units = [
		config.filesize_b_text,
		config.filesize_kb_text,
		config.filesize_mb_text,
		config.filesize_gb_text
	]
	for (let i = 1; i < 5; i++) {
		let fak = Math.pow(1024, i)
		if (bytes / fak < 1) {
			let size = (bytes/Math.pow(1024, i-1))
						.toFixed(Math.min(i-1, 2)) // trim
			if (rounded) {
				size = Number(size).toFixed(0)
			}
			return `${size}${units[i-1]}` 
		}
	}
	return bytes + units[0] // fallback
}

export const pretty_time = (seconds, force_hours=false) => {
	seconds = Math.round(seconds) // just to be sure
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	seconds = Math.ceil((seconds % 3600) % 60)
	if (hours || force_hours) {
		return (`${("0"+hours).slice(-2)}:${("0"+minutes).slice(-2)}:${("0"+seconds).slice(-2)}`)
	}
	else {
		return (`${("0"+minutes).slice(-2)}:${("0"+seconds).slice(-2)}`)
	}
}

export const is_in_view = (oElement, oContainer) => {
	const elementRect = oElement.getBoundingClientRect()
	const containerRect = oContainer.getBoundingClientRect()
	return (
	    elementRect.top >= containerRect.top &&
	    elementRect.bottom <= containerRect.bottom
	)
}