import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext, useEffect } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'

import M from "../../classes/Message.js"
import "../../assets/stylesheets/auto_responder.scss"

const AutoResponder = (props) => {

	const state = useContext(AppState)

	// register events to update patience state and send auto reply
	useEffect(()=>{
		if (!state.customerSentMessage.value) return

		// send auto reply
		setTimeout(()=>{
			// only send once
			if (state.autoResponseSent.value) return

			state.messages.value = [
				...state.messages.peek(),
				M.system(config.auto_response_message)
			] 
		}, config.auto_response_message_delay * 1000)

		// send patience message and show indicator if necessary
		setTimeout(()=>{
			if (!state.adminAnswered.value) {
				if (!state.patienceMessageSent.value) { // only send once
					state.messages.value = [
						...state.messages.peek(),
						M.system(config.please_be_patient_message)
					]
				}
			}
		}, config.please_be_patient_message_delay * 1000)
	}, [state.customerSentMessage.value])
				
	useEffect(()=>{
		if (state.patienceMessageSent.value)
			state.isPatient.value = true

	}, [state.patienceMessageSent.value])


	// remove patience message after admin replied
	useEffect(()=>{
		if (state.adminAnswered.value) {
			Logger.debug("Removing patience message..")
			state.messages.value = state.messages.peek().filter((m)=>{
				return m.text !== config.please_be_patient_message
			})
		}
	}, [state.adminAnswered.value])

    return (
    	<>
	    	{ state.isPatient.value
	        ? <li className="patience-indicator">
				<span className="dot_1" />
				<span className="dot_2" />
				<span className="dot_3" />
			</li>
			: null}
		</>
    )
}

export default AutoResponder
  