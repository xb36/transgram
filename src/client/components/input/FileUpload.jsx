import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import config from "../../client_configuration.js"
import {AppState} from "../../state/app_state.js"
import { useContext, useState, useEffect, useRef } from 'preact/hooks'
import Socket from "../../controllers/socket_controller.js"
import Cookie from "../../controllers/cookie_controller.js"
import M from "../../classes/Message.js"
import FileStreamer from "../../libs/FileStreamer.mjs"
import {pretty_filesize} from "../../helpers/messages_helper.js"
import "../../assets/stylesheets/upload.scss"

import PrmackAttributionCC from "../attribution/PrmackAttributionCC"
import ProgressBar from "./ProgressBar"

const FileUpload = (props) => {

	const state = useContext(AppState)

	const [progress, setProgress] = useState(0)
	const [transferError, setTransferError] = useState(null)
	const transferErrorRef = useRef(null)

	useEffect(()=>{
		transferErrorRef.current = transferError
	}, [transferError])


	useEffect(()=>{

		if (state.chatRef.current) {
			add_drop_listeners()
		} else {
			window.addEventListener("load", () => {
				add_drop_listeners()
			})
		}

		return () => {
			remove_drop_listeners()
		}
	}, [])

	const add_drop_listeners = () => {
		Logger.debug("Attaching drop listeners")
		const chatElement = document.getElementById("transgram-chat")
		chatElement.addEventListener("drop", handle_drop)
		chatElement.addEventListener("dragover", handle_drag_over)
	}

	const remove_drop_listeners = () => {
		Logger.debug("Deattaching drop listeners")
		const chatElement = document.getElementById("transgram-chat")
		chatElement.removeEventListener("drop", handle_drop)
		chatElement.removeEventListener("dragover", handle_drag_over)

	}

	const handle_file_input = (oFile) => {
		const stream = new FileStreamer(Socket.get(), oFile, Cookie.get())
		stream.onTransferComplete = (oResult) => {
			if (oResult.ok)
				state.messages.value = state.messages.value.concat(
					new M(oResult.message)
				)
			// todo: handle not okay (checksum check failed)
		}
		
		stream.onTranferError = (oError) => {
			let msg = ""
			switch(oError.code){
			case 413: // file too big
				msg = `${config.upload_error_messages[413]} ${pretty_filesize(oError.max_size, true)}.`
				break;
			default:
				msg = config.upload_error_messages[oError.code]
			}
			state.messages.value = state.messages.value.concat(
					M.system(msg)
				)
			setTransferError(true)
		}

		stream.start()


		const interval = setInterval(()=>{
			const prog = stream.getProgress()
			setProgress(prog)

			if (prog > 1 || transferErrorRef.current) {
				clearInterval(interval)
				setProgress(1)
				setTimeout(()=>{
					setProgress(0)
				}, 500)
				setTransferError(false)
				Logger.debug("Stopped to monitor upload progress")
			}
		}, 200)
	}

	const handle_file_change = (event) => {
		const file = event.target.files[0]
		handle_file_input(file)
	}

	const handle_drop = (event) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0]
		handle_file_input(file)
	}

	const handle_drag_over = (event) => {
		event.preventDefault()
	}


	return (
		<>
			<ProgressBar progress={progress} />
				<label for="chat-file-input">
					<svg className="chat-media-input-image" 
						viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
					    <path d="M9 3.793V9H7V3.864L5.914 4.95 4.5 3.536 8.036 0l.707.707.707.707 2.121 2.122-1.414 1.414L9 3.793zM16 11v5H0v-5h2v3h12v-3h2z" fill-rule="evenodd"/>
					</svg>
					<PrmackAttributionCC />
				</label>
			
			<input 	onChange={handle_file_change} 
					type="file" 
					id="chat-file-input" 
					name="chat-file-input" 
					accept="image/*, video/*, audio/*,
					application/pdf, text/plain,
					.zip, .rar, .7zip,
					application/zip" />
		</>
	)
}

export default FileUpload