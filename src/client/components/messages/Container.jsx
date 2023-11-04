import { useEffect, useContext } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'
import UnreadIndicator from "./UnreadIndicator"
import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"

import Storage from "../../controllers/storage_controller.js"
import M from "../../classes/Message.js"

import Message from "./Message"
import AutoResponder from "./AutoResponder"
import ExportSelect from "../header/ExportSelect"

import {is_in_view} from "../../helpers/messages_helper.js"

function Container() {

	const state = useContext(AppState)

	// set visible messages to unread=false
	const update_read = () => {
		state.unreadIds.value.forEach((id)=>{
			const elem = document.getElementById(`msg_${id}`)
	        if (is_in_view(elem, state.wrapperRef.current)) {
	            state.messages.value = state.messages.value.map(
	                    (m) => m.id == id ? {...m, ...{unread: false}} : m
	        )}
		})
	}

	const apply_scroll = (iHeight) => {
		setTimeout(()=>{
			state.containerRef.current.scrollTop = iHeight
			Storage.removeScrollHeight()
		}, 25) // raise this number if scroll position is not set correctly after page reload
	}

	// update read state on chat open
	useEffect(()=>{
		if (!state.isOpen.value) return
		update_read()
	}, [state.isOpen.value])

	// register scroll listener to react on new messages
	useEffect(()=>{
		state.containerRef.current.addEventListener("scroll", update_read)
		return ()=>{
			state.containerRef.current.removeEventListener("scroll", update_read)
		}
	}, [])


	// scroll down on new message unless threshhold is reached
	useEffect(()=>{
		// don't mess with scrolling when there are no messages
		if (state.messages.value.length === 0) return
		// dont scroll closed chat..
		if (!state.isOpen.value) return
		const scrollY = 
			state.containerRef.current.scrollHeight 
			- (state.containerRef.current.scrollTop
				+ state.containerRef.current.offsetHeight)
		if (scrollY < config.chat_scroll_breakpoint) 
			state.scrollDummyRef.current.scrollIntoView({behavior: "smooth"})
	}, [state.messages.value.length])


	// scroll to last position after page reload
	useEffect(()=>{
		// after page reload, stay at scroll position
		const check = Storage.getScrollHeight()
		if (check !== null) {
			Logger.debug(`Scrollheight in storage: ${check}`)
			apply_scroll(check)
			return
		}
	}, [])



    return (
		<div className="messages-wrapper" ref={state.wrapperRef} >
			<ol className='messages-container' ref={state.containerRef}>
				{
					state.messages.value.length === 0
					? <Message message={M.system(config.welcome_message)} />
					: null
				}
				{state.messages.value.map((msg)=>{
					return <Message message={msg} />
				})}
				<li ref={state.scrollDummyRef}></li>
				<AutoResponder />
			</ol>
			{
				state.unreadIds.value.length
				? <UnreadIndicator />
				: null
			}
			{state.exportOptionsVisible.value &&
				<ExportSelect />
			}
		</div>
    )
}

export default Container
  