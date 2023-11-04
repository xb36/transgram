import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'


function TextMessage(props) {

	const state = useContext(AppState)

    return (
        <div className="text message">
            {props.message.text}
        </div>
    )
}

export default TextMessage