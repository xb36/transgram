import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext, useState, useEffect } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import FullscreenModal from "./FullscreenModal.jsx"
import DocumentMessage from "./DocumentMessage"
import ImagePlaceholder from "./ImagePlaceholder"

function PhotoMessage(props) {

	const state = useContext(AppState)

    // check image compatibility first
    const [payload, setPayload] = useState(<ImagePlaceholder />)
    const [fs, setFS] = useState(false)

    const open_in_fullscreen = () => {
        Logger.debug("fs")
        setFS(true)
    }

    const check_image_compatibility = (message)=>{
        return new Promise((resolve, reject)=>{
            const img = new Image()
            img.addEventListener('load', function() {
              console.log('Image can be displayed');
              resolve()
            })
            img.addEventListener('error', function() {
              console.log('Image cannot be displayed');
              reject()
            })
            img.src = message.url
        })
    }

    useEffect(()=>{

        check_image_compatibility(props.message)
        .then(()=>{
            setPayload(
                <div className="photo message">
                    <img className="photo" 
                            style={{ backgroundImage: "url(" + props.message.url + ")" }}
                            onClick={open_in_fullscreen} />
                    {fs 
                    ? <FullscreenModal message={props.message} setFS={setFS} />
                    : null }
                </div>
            )
        })
        .catch(()=>{
            setPayload(<DocumentMessage message={props.message} />)
        })

    }, [fs, props.message])


    return payload

}

export default PhotoMessage
  