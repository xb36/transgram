import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'
import {pretty_filesize} from "../../helpers/messages_helper.js"

function DocumentMessage(props) {

	const state = useContext(AppState)

    return (
        <div className="document message">
            <a href={props.message.url} >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V20C21 21.6569 19.6569 23 18 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V4C19 3.44772 18.5523 3 18 3ZM6.41421 7H9V4.41421L6.41421 7Z" /></svg>
            </a>
            <div className="document-meta">
                <a href={props.message.url} 
                    download={props.message.name}
                    target="_blank">
                    <strong>{props.message.name}</strong>
                </a>
                <p>{config.file_type_text}: {props.message.type}</p>
                <p>{config.file_size_text}: {pretty_filesize(props.message.size)}</p>
            </div>
        </div>
    )
}

export default DocumentMessage
  