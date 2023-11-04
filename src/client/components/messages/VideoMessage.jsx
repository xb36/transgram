import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'
import DocumentMessage from "./DocumentMessage"

function VideoMessage(props) {

	const state = useContext(AppState)

    const video = document.createElement('video')
    if (!video.canPlayType(props.message.type))
        return <DocumentMessage message={props.message} />

    return (
        <div className="video message">
            <video className="video" controls>
                <source src={props.message.url} type={props.message.type} />
                Unsupported
            </video>
        </div>
    )
}

export default VideoMessage
  