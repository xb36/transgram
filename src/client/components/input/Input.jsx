import { useContext, useEffect } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'
import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"

import Socket from "../../controllers/socket_controller.js"
import M from "../../classes/Message.js" 

import FileUpload from "./FileUpload"

function Input() {

	const state = useContext(AppState)

	const send_message = () => {
		const val = state.inputValue.value
		if (val.trim() == "") return		

		Socket.sendMessage(val)
		.then((result)=>{
			state.messages.value = 
			state.messages.value.concat([
				new M({
					id: result.id,
					text: val
				})
			])
			state.inputValue.value = ""
		}).catch((error)=>{
			Logger.error(error)
		})
		state.inputRef.current.focus()
	}


	useEffect(()=>{
		if (state.isOpen.value) {
			state.inputRef.current.focus()
		}
	}, [state.isOpen.value])

	const inputChanged = (event) => {
		if (event.keyCode == 13 && !event.shiftKey) { 
			send_message()
			return
		}
		state.inputValue.value = event.target.value
	}

	const handleNewline = (event) => {
		if (event.keyCode == 13 && !event.shiftKey) event.preventDefault()
	}

    return (
		<div className="input-wrapper">
			<FileUpload />
			<textarea
				rows="3"
				className={state.inputValue.value.length > 0 
					? "has-input chat-input"
					: "chat-input"}
				type="text"
				key="chat-input"
				value={state.inputValue}
				placeholder={config.chat_placeholder}
				onKeyUp={inputChanged}
				onKeyDown={handleNewline}
				ref={state.inputRef}
			/>
			<svg className="submit" onclick={send_message} xmlns="http://www.w3.org/2000/svg" width="2.6in" height="2.59667in" viewBox="0 0 780 779"><path id="Selection" fill="#000" stroke="black" stroke-width="1"d="M 244.00,28.00 C 244.00,28.00 262.00,40.67 262.00,40.67  262.00,40.67 298.00,64.72 298.00,64.72  298.00,64.72 445.00,163.34 445.00,163.34  445.00,163.34 663.00,309.67 663.00,309.67  663.00,309.67 739.00,360.67 739.00,360.67  739.00,360.67 780.00,388.00 780.00,388.00  780.00,388.00 780.00,383.00 780.00,383.00  780.00,383.00 777.17,349.00 777.17,349.00  772.97,306.97 762.36,265.48 744.69,227.00  695.76,120.42 600.92,40.11 487.00,11.63  464.60,6.03 442.01,2.52 419.00,0.91  419.00,0.91 409.00,0.00 409.00,0.00  409.00,0.00 368.00,0.00 368.00,0.00  347.61,0.03 311.26,7.06 291.00,12.13  277.97,15.38 255.60,21.99 244.00,28.00 Z M 117.00,110.00 C 91.18,136.05 66.84,166.66 49.31,199.00  22.34,248.75 5.86,303.53 1.91,360.00  1.91,360.00 0.00,383.00 0.00,383.00  0.00,383.00 1.83,417.00 1.83,417.00  1.83,417.00 4.28,444.00 4.28,444.00  9.75,484.60 23.46,527.41 41.75,564.00  55.89,592.27 73.23,619.02 93.87,643.00  100.01,650.13 110.77,662.82 118.00,668.00  118.00,668.00 118.00,274.00 118.00,274.00  118.00,274.00 118.00,160.00 118.00,160.00  118.00,160.00 118.00,127.00 118.00,127.00  118.00,127.00 117.00,110.00 117.00,110.00 Z M 242.00,177.00 C 242.00,177.00 242.00,601.00 242.00,601.00  242.00,601.00 275.00,579.67 275.00,579.67  275.00,579.67 340.00,536.03 340.00,536.03  340.00,536.03 469.00,449.66 469.00,449.66  469.00,449.66 529.00,409.33 529.00,409.33  529.00,409.33 558.00,390.00 558.00,390.00  558.00,390.00 558.00,388.00 558.00,388.00  558.00,388.00 523.00,364.67 523.00,364.67  523.00,364.67 458.00,321.02 458.00,321.02  458.00,321.02 399.00,281.67 399.00,281.67  399.00,281.67 321.00,229.33 321.00,229.33  321.00,229.33 269.00,194.33 269.00,194.33  269.00,194.33 242.00,177.00 242.00,177.00 Z M 779.04,390.00 C 779.04,390.00 747.00,411.67 747.00,411.67  747.00,411.67 675.00,460.02 675.00,460.02  675.00,460.02 610.00,503.67 610.00,503.67  610.00,503.67 393.00,649.66 393.00,649.66  393.00,649.66 288.00,720.00 288.00,720.00  288.00,720.00 258.00,740.28 258.00,740.28  253.44,743.47 247.78,746.03 245.00,751.00  245.00,751.00 266.00,758.66 266.00,758.66  266.00,758.66 301.00,768.35 301.00,768.35  321.22,772.98 341.43,775.20 362.00,777.17  362.00,777.17 380.00,778.96 380.00,778.96  380.00,778.96 394.00,778.00 394.00,778.00  394.00,778.00 410.00,778.00 410.00,778.00  410.00,778.00 420.00,777.09 420.00,777.09  442.04,775.57 463.54,772.24 485.00,766.87  596.89,738.90 687.64,665.21 739.25,562.00  759.95,520.60 770.34,482.68 776.28,437.00  776.28,437.00 779.04,405.00 779.04,405.00  779.45,399.81 781.01,395.07 779.04,390.00 Z" /></svg>
		</div>
    )
}

export default Input
  