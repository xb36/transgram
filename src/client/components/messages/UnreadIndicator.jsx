import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'

import "../../assets/stylesheets/unread_indicator.scss"

const UnreadIndicator = (props) => {

	const state = useContext(AppState)

	const scroll_down = ()=>{
		state.scrollDummyRef.current.scrollIntoView({behavior: "smooth"})
	}

    return (
        <div className="unread-indicator" onClick={scroll_down}>
        	<p className="down-arrow">
        		&#x221F;
        	</p>
        	<p className="unread-count">
        		{state.unreadIds.value.length}
        	</p>
        </div>
    )
}

export default UnreadIndicator