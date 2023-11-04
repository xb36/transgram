import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext, useState } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'

import "../../assets/stylesheets/message_preview.scss"


const MessagePreview = (props) => {

	const state = useContext(AppState)

	const [visible, setVisible] = useState(true)

	const dismiss = (e) => {
		Logger.debug("dismiss")
		setVisible(false)
		e.stopPropagation()
	}

	const format_preview = (oMsg) => {
		if (oMsg.type === "text")
			return oMsg.text
		else
			return config.file_preview[oMsg.type.split("/")[0]] 
				|| config.file_preview["document"]
	}

    return (
    	<>
    	{visible &&
    		<div className="message-preview">
				<p onClick={dismiss}>
					{format_preview(state.lastUnreadMessage.value) }
				</p>
				<span>{/*speech bubble thingy*/}</span>
	        </div>   

    	}
    	</>
    )
}

export default MessagePreview
  