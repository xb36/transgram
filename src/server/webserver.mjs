import {SystemLogger as Logger} from "../shared/libs/Logger.mjs"
import express from "express"
import ViteExpress from "vite-express"
import cors from 'cors';
import config from "./server_configuration.mjs"
import {fileTypeFromBuffer} from 'file-type';
import {readChunk} from 'read-chunk';
import path from "path"
import fs from "node:fs"

/**
 * @class
 * @hideconstructor
 */
class Webserver {

	static start() {
		const app = express();
		app.use(cors({
		    origin: process.env.ALLOWED_ORIGINS.split(" "),
		    optionsSuccessStatus: 200 // For legacy browser support
		}))
		/*
		// for debugging request headers
		app.use(Webserver.logRequestHeaders)
		*/
		app.get(`${config.uploads_path}/:filename`, (req, res)=>{
		    const filepath = path.resolve(config.uploads_directory, req.params.filename)
		    // if file not exists return !!
		    if (!fs.existsSync(filepath))  {
		        res.status(404).send("Not found.");
		        return
		    }
		    const bufferlength = 4100
		    readChunk(filepath, {length: bufferlength})
		    .then((buffer)=> {
		        fileTypeFromBuffer(buffer)
		        .then((result) => {
		            if(result) {
		                const {mime} = result
		                res.setHeader("Content-Type", mime)
		            }
		            res.sendFile(filepath)
		        })
		    })
		})

		app.use(ViteExpress.static())

		const server = ViteExpress.listen(app, process.env.PORT, () =>
		  	Logger.info(`Server is listening on port ${process.env.PORT}...`)
		);

		return {app, server}

	}
/*
	// for debugging request headers
	static logRequestHeaders(req, res, next) {
		console.log("Request Headers:", req.headers)
		next();
	}
*/
}

export default Webserver