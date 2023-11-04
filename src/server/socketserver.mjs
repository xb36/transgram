import {SystemLogger as Logger} from "../shared/libs/Logger.mjs"
import { Server } from "socket.io"
/**
 * @class
 * @hideconstructor
 */
class Socketserver {

	static start(oServer) {
		return new Server(oServer, {
			cors: {
				origin: process.env.ALLOWED_ORIGINS.split(" ")
			}
		})
	}
	
}
export default Socketserver