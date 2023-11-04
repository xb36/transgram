import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext, useState, useEffect } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'

import TextMessage from "./TextMessage"
import VideoMessage from "./VideoMessage"
import AudioMessage from "./AudioMessage"
import PhotoMessage from "./PhotoMessage"
import DocumentMessage from "./DocumentMessage"

// for debugging
import ImagePlaceholder from "./ImagePlaceholder"


import {is_in_view} from "../../helpers/messages_helper.js"

import "../../assets/stylesheets/message.scss"

function Message(props) {

	const state = useContext(AppState)

    let payload = null
    if (props.message.type === "text") payload = <TextMessage message={props.message} />
    else {
        switch (props.message.type.split("/")[0]) {
            case "video": payload = <VideoMessage message={props.message} />; break
            case "audio": payload = <AudioMessage message={props.message} />; break
            case "image": payload = <PhotoMessage message={props.message}/>; break
            default: payload = <DocumentMessage message={props.message} />; break
        }
    }

    useEffect(()=>{        
        if (props.message.owner !== "admin") return // only check admin messages
        const elem = document.getElementById(`msg_${props.message.id}`)
        if (is_in_view(elem, state.wrapperRef.current) && state.isOpen.value) {
            state.messages.value = state.messages.value.map(
                    (m) => m.id == props.message.id ? {...m, ...{unread: false}} : m
        )}
        else
            Logger.info(`Not in view: ${props.message.id}`)
    }, [])


    return (
        <li className={props.message.owner.concat(" message-container")}
            id={`msg_${props.message.id}`}
            >
            <p className="sender">{props.message.owner === "customer" 
                ? config.customer_pronoun 
                : config.admin_pronoun}</p> 

            {payload}

            {/*<p className="time">
                {timeFormat(time)}
            </p>*/}
        </li>
    )
}

export default Message
  