import { useContext, useEffect, useState } from "preact/hooks";
import {AppState} from "../state/app_state.js"
import config from "../client_configuration"
import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"

import Header from "./header/Header"
import Container from "./messages/Container.jsx"
import Input from "./input/Input.jsx"

import Socket from "../controllers/socket_controller.js"

import "../assets/stylesheets/chat.scss"

const Chat = () => {

	const state = useContext(AppState)

	const [wasOpen, setWasOpen] = useState(false) // workaround to prevent double socket registration

	useEffect(()=>{
		if (state.isOpen.peek() && !state.isConnected.peek() && !wasOpen) {
			setWasOpen(true)
			Logger.debug("Chat was opened && not connected -> attemting initial socket connection")
			Socket.connect(state)
		}
	}, [state.isOpen.peek()])

	return (
		<div id="transgram-chat"
			className={state.isOpen.value 
				? "transgram-chat" 
				: "transgram-chat hidden"}
			ref={state.chatRef} >
			<Header />
			<Container />
			<Input />
		</div>
	)
}

export default Chat