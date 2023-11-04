import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext, useRef, useEffect, useState } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'

import {pretty_time} from "../../helpers/messages_helper.js"


const AudioMessage = (props) => {

	const state = useContext(AppState)

    const [playing, setPlaying] = useState(false)
    const [finished, setFinished] = useState(false)
    const [currentTime, setCurrentTime] = useState(0) 
    const isDragging = useRef(false)

    const audioRef = useRef(null)
    const indicatorRef = useRef(null)
    const trackRef = useRef(null)


    const handle_mouse_down = () => {
        document.addEventListener("mouseup", handle_mouse_up)
        document.addEventListener("mousemove", handle_mouse_move)
        isDragging.current = true
    }
    const handle_mouse_move = (event) => {
        if (isDragging.current) {
            const { left, width } = trackRef.current.getBoundingClientRect()
            const { pageX } = event
            const offsetX = pageX - left
            const newCurrentTime = Math.max(0, Math.min(props.message.duration, (offsetX / width) * props.message.duration))
            setCurrentTime(newCurrentTime)
            audioRef.current.currentTime = newCurrentTime
        }
    }

    const handle_click = (event) => {
        const { left, width } = trackRef.current.getBoundingClientRect()
        const { clientX } = event
        const offsetX = clientX - left
        const newCurrentTime = Math.max(0, Math.min(props.message.duration, (offsetX / width) * props.message.duration))
        setCurrentTime(newCurrentTime)
        audioRef.current.currentTime = newCurrentTime
    }
    
    const handle_mouse_up = () => {
        document.removeEventListener("mouseup", handle_mouse_up)
        document.removeEventListener("mousemove", handle_mouse_move)
        isDragging.current = false
    }

    const update_time = () => {
        setCurrentTime(audioRef.current.currentTime)
    }
    const toggle_playback = () => {
        setPlaying(!playing)
    }
    useEffect(() => {
        if (playing) audioRef.current.play()
        else audioRef.current.pause()
    }, [playing])

    const progressStyle = 
    {width: `${currentTime / props.message.duration * 100}%`}
    const indicatorStyle = 
    {left: "calc(" + (currentTime / props.message.duration * 100) + "% - 0.5em)"}




    return (
        <div className="audio message">
            <audio ref={audioRef} ontimeupdate={update_time}>
                <source src={props.message.url} type={props.message.type} />
            </audio>
            <div className="ctrl-container">
                <div className="button-container" onClick={toggle_playback}>
                    { playing 
                    ? <svg className="pause-button" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 47.607 47.607" xml:space="preserve"><g><path d="M17.991,40.976c0,3.662-2.969,6.631-6.631,6.631l0,0c-3.662,0-6.631-2.969-6.631-6.631V6.631C4.729,2.969,7.698,0,11.36,0 l0,0c3.662,0,6.631,2.969,6.631,6.631V40.976z"/><path d="M42.877,40.976c0,3.662-2.969,6.631-6.631,6.631l0,0c-3.662,0-6.631-2.969-6.631-6.631V6.631 C29.616,2.969,32.585,0,36.246,0l0,0c3.662,0,6.631,2.969,6.631,6.631V40.976z"/></g></svg>
                    :   (finished 
                        ? <svg className="replay-button" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 74.999 74.999" xml:space="preserve"><g><path d="M33.511,71.013c15.487,0,28.551-10.563,32.375-24.859h9.113L61.055,22L47.111,46.151h8.006 c-3.44,8.563-11.826,14.628-21.605,14.628c-12.837,0-23.28-10.443-23.28-23.28c0-12.836,10.443-23.28,23.28-23.28 c6.604,0,12.566,2.768,16.809,7.196l5.258-9.108c-5.898-5.176-13.619-8.32-22.065-8.32C15.034,3.987,0,19.019,0,37.5 C-0.002,55.981,15.03,71.013,33.511,71.013z"/></g></svg>
                        : <svg className="play-button"
                            viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/></svg>
                        )
                    }
                    <span style="display: none">props to FortAwesome for this nice play button</span>
                </div>
                <div className="position-indicator"
                        onclick={handle_click}>
                    <div className="track" 
                        ref={trackRef} />

                    <div className="progress" style={progressStyle}/>

                    <div className="indicator" 
                        style={indicatorStyle} 
                        onmousedown={handle_mouse_down}
                        ref={indicatorRef}/>

                </div>
                <p className="time-display">
                    {pretty_time(currentTime)}/{pretty_time(props.message.duration)} 
                </p>
            </div>
        </div>
    )
}

export default AudioMessage
  