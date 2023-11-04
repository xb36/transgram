import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"
import { useContext, useState } from "preact/hooks";
import {AppState} from "../../state/app_state.js"
import config from '../../client_configuration.js'
import "../../assets/stylesheets/export_select.scss"

import PrmackAttributionCC from "../attribution/PrmackAttributionCC"


// this file is imported by messages/container component

const ExportSelect = (props) => {

	const state = useContext(AppState)

	const [finished, setFinished] = useState(false)
	const [successMessage, setSuccessMessage] = useState("")

	const prepare_history = () => {
		let last = null
		return state.messages.value
			.filter((m)=>["admin", "customer"].includes(m.owner))
			.map((m)=>{
				let str = ""
				if (last && last !== m.owner)
					str += "\n"
				if (m.owner === "customer") {
					str += config.customer_pronoun
				} else if (m.owner === "admin") {
					str += config.admin_pronoun
				}
				str += `: ${_indentation_for(m.owner)}`
				if (m.type === "text")
					str += `${m.text}`
				else {
					str += `${config.file} (${m.url})`
				}
				last = m.owner
				return str
		}).join("\n")
	}


	const _indentation_for = (sOwner) => {

		return ""

		// use monospace for this to work !

		const adm_len = config.admin_pronoun.length
		const cust_len = config.customer_pronoun.length
		if (sOwner === "customer" && cust_len < adm_len)
			return Array(adm_len - cust_len + 1).join(" ")
		else if (sOwner === "admin" && adm_len < cust_len)
			return Array(cust_len - adm_len + 1).join(" ")
		return ""
	} 

	const to_clipboard = (event) => {
		const history = prepare_history()
		navigator.clipboard.writeText(history)
		setSuccessMessage(config.clipboard_success)
		setFinished(true)
	}

	const as_file = (event) => {
		const blob = new Blob([prepare_history()], 
			{type: "text/plain"})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		const date = new Date()
		const minutes = String(date.getMinutes()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		a.download = `${config.history_file_prefix}_${day}-${month}-${year}-${hours}${minutes}.txt`
		a.style.display = "none"
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		setSuccessMessage(config.download_success)
		setFinished(true)
	}

	const close_dialog = () => {
		state.exportOptionsVisible.value = false
	}

	const prevent_close = (event) => {
		event.stopPropagation()
	}

    return (
        <div className="export-options-container"
        	onClick={close_dialog}>
	    	{ finished 

	    	?	<div className="success"
			    	onClick={prevent_close}>
	    			<div className="check" />
	    			<p>{successMessage}</p>
	    		</div>
	    	
			:	<div className="export-options"
			    	onClick={prevent_close}>
	        		<ul>
	        			<p className="heading">{config.export_chat_history}</p>
			            <li className="option clipboard"
			            	onClick={to_clipboard}>
			            	<svg viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M22.6,4H21.55a3.89,3.89,0,0,0-7.31,0H13.4A2.41,2.41,0,0,0,11,6.4V10H25V6.4A2.41,2.41,0,0,0,22.6,4ZM23,8H13V6.25A.25.25,0,0,1,13.25,6h2.69l.12-1.11A1.24,1.24,0,0,1,16.61,4a2,2,0,0,1,3.15,1.18l.09.84h2.9a.25.25,0,0,1,.25.25Z" class="clr-i-outline clr-i-outline-path-1"></path><path d="M33.25,18.06H21.33l2.84-2.83a1,1,0,1,0-1.42-1.42L17.5,19.06l5.25,5.25a1,1,0,0,0,.71.29,1,1,0,0,0,.71-1.7l-2.84-2.84H33.25a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2"></path><path d="M29,16h2V6.68A1.66,1.66,0,0,0,29.35,5H27.08V7H29Z" class="clr-i-outline clr-i-outline-path-3"></path><path d="M29,31H7V7H9V5H6.64A1.66,1.66,0,0,0,5,6.67V31.32A1.66,1.66,0,0,0,6.65,33H29.36A1.66,1.66,0,0,0,31,31.33V22.06H29Z" class="clr-i-outline clr-i-outline-path-4"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>
			            	<p>{config.copy_to_clipboard}</p>
			            </li>
			            {config.customer_email &&
				            <li className="option email">
				            	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12ZM16 12V13.5C16 14.8807 17.1193 16 18.5 16V16C19.8807 16 21 14.8807 21 13.5V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21H16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				            	<p>{config.send_via_email}</p>
				            </li>
			        	}
			            <li className="option txt"
			            	onClick={as_file}>
			            	<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M7 5.222V0h2v5.193l1.107-1.107L11.52 5.5 7.986 9.036 4.45 5.5l1.414-1.414L7 5.222zM16 11v5H0v-5h2v3h12v-3h2z" fill-rule="evenodd"/></svg>
			            	<PrmackAttributionCC />
			            	<p>{config.download_as_txt}</p>
			            </li>
			        </ul>
				</div>
    		}
        </div>
    )
}

export default ExportSelect
  