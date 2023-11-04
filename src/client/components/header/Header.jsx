import { useContext, useState } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from "../../client_configuration"

const Header = () => {

	const state = useContext(AppState)

	const toggle_options = () => {
		state.exportOptionsVisible.value = 
		 !state.exportOptionsVisible.value
	}

	return (
		<div className="header">
			<svg className="export" 
				onClick={toggle_options} 
				viewBox="-6.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M12.188 4.469v4.656h2.438l-4.875 5.875-4.875-5.875h2.563v-4.656h4.75zM16.313 12l2.844 4.5c0.156 0.375 0.344 1.094 0.344 1.531v8.656c0 0.469-0.375 0.813-0.813 0.813h-17.844c-0.469 0-0.844-0.344-0.844-0.813v-8.656c0-0.438 0.156-1.156 0.313-1.531l2.844-4.5c0.156-0.406 0.719-0.75 1.125-0.75h1.281l1.313 1.594h-2.625l-2.531 4.625c-0.031 0-0.031 0.031-0.031 0.063 0 0.063 0 0.094-0.031 0.125h16.156v-0.125c0-0.031-0.031-0.063-0.031-0.094l-2.531-4.594h-2.625l1.313-1.594h1.25c0.438 0 0.969 0.344 1.125 0.75zM7.469 21.031h4.594c0.406 0 0.781-0.375 0.781-0.813 0-0.406-0.375-0.781-0.781-0.781h-4.594c-0.438 0-0.813 0.375-0.813 0.781 0 0.438 0.375 0.813 0.813 0.813z"></path></svg>{/* OFL License */}
			<p className="headline">{config.chat_header_text}</p>
			<div className="close-button" 
				onclick={()=>state.isOpen.value = false} />
		</div>
	)
}

export default Header