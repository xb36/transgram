import { useContext, useEffect } from "preact/hooks";
import {AppState} from "../state/app_state.js"
import config from "../client_configuration"
import Storage from "../controllers/storage_controller.js"
import {BrowserLogger as Logger} from "../../shared/libs/Logger.mjs"
import "../assets/stylesheets/toggle.scss"
import Socket from "../controllers/socket_controller.js"
import M from "../classes/Message.js"
import MessagePreview from "./toggle/MessagePreview"

const Toggle = () => {

	const state = useContext(AppState)

	// handle continuous connection
	// (leave inital connection to Chat component)
	useEffect(()=>{

		init()
		load_state()
		window.addEventListener("beforeunload", save_state)

		return ()=>{
			window.removeEventListener("beforeunload", save_state)
		}

	},[])

	const init = () => {
		Socket.onMessage = (oData) => {
			Logger.debug(oData)
			const msg = new M(oData)
			if (msg.owner === "admin")
				msg.unread = true
			state.messages.value = state.messages.value.concat([msg])
		}
	}

	const load_state = ()=>{
		const last = Storage.getLastUsageTimestamp()
		if (last < + new Date() - config.preserve_chat_seconds * 1000) {
			Logger.debug("Removing old state")
			Storage.removeConnectionToken()
			Storage.removeMessages()
			Storage.removeChatOpenState()
			Storage.removeInputValue()
			Storage.removeAutoResponseSent() // set by context provider
		} else {
			Logger.debug("Loading state from storage")
			state.messages.value = Storage.getMessages()
			state.isOpen.value = Storage.getChatOpenState()
			state.inputValue.value = Storage.getInputValue()
		}

	}

	const save_state = ()=>{
		Storage.setLastUsageTimestamp(+ new Date())
		Storage.setMessages(state.messages.value)
		Storage.setChatOpenState(state.isOpen.value)
		Storage.setInputValue(state.inputValue.value)
		// this will be fetched within container
		alert(state.containerRef.current.scrollTop)
		Storage.setScrollHeight(state.containerRef.current.scrollTop)
	}

	return (

		<button className={
				state.isOpen == true 
				?  "transgram-chat-widget open" 
				: "transgram-chat-widget closed"
			}
			onclick={()=>state.isOpen.value = !state.isOpen.value}>
			{
				state.isOpen == true
				? config.open_widget_label
				: config.closed_widget_label
			}
			{
				state.unreadIds.value.length > 0 
				&&
				<p className="unread-count">
	        		{state.unreadIds.value.length}
	        	</p> 
			}
			{
				state.unreadIds.value.length > 0
	        	&&
	        	<MessagePreview />
			}
		</button>
	)

}

export default Toggle