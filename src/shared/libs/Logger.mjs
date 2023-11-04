import pc from "picocolors"

const LOG_LEVEL_LABELS = ["", "error", "warning", "info", "debug"]

export class BrowserLogger {

	static debug(message) {
		this.log(message, 4)
	}
	static info(message) {
		this.log(message, 3)
	}
	static warning(message) {
		this.log(message, 2)
	}
	static error(message) {
		this.log(message, 1)
	}

	static log(message, level) {
		

		let style;
		switch(level) {
			case 4:
				style = 'color: darkgray'
				break
			case 3:
				style = "color: lightblue"
				break
			case 2:
				style = "color: yellow"
				break
			case 1:
				style = "color: red"
				break
		}

		const log_fun = level === 1 ? console.trace : console.log

		if (typeof message === 'object') {
			console.log(`%c[${LOG_LEVEL_LABELS[level]}]:`, style)	
			log_fun(message)
		} else {
			log_fun(`%c[${LOG_LEVEL_LABELS[level]}]: ${message}`, style)	
		}
	}
}

export class SystemLogger {

	static log(message, level) {

		if (process.env.LOG_LEVEL < level) {return}
		
		const timestamp = new Date().toLocaleString("en-US").split(",")[1].trim();
		const time = `${pc.dim(timestamp)}`

		let col;

		switch (level) {
			case 4:
				col = pc.dim
				break;
			case 3:
				col = pc.cyan
				break;
			case 2:
				col = pc.yellow
				break;
			case 1:
				col = pc.red
				break;
		}

		message = typeof(message) == "object" ? JSON.stringify(message) : message
		let res = `${time} ` + col(`[${LOG_LEVEL_LABELS[level]}] ${message}`)
	
		level === 1 ? console.trace(res) : console.log(res)

	}

	static debug(message) {
		this.log(message, 4)
	}
	static info(message) {
		this.log(message, 3)
	}
	static warning(message) {
		this.log(message, 2)
	}
	static error(message) {
		this.log(message, 1)
	}

}