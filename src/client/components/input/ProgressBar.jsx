import { useState, useEffect, useRef } from 'preact/hooks'
import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"

const ProgressBar = (props) => {

	const [visible, setVisible] = useState(false)

	useEffect(()=>{
		if(props.progress > 0) {
			setVisible(true)
		} else {
			setVisible(false)
		}
	},[props.progress])

	return (
		<>

			<span className={visible ? "progress-bar" : "progress-bar hidden"}
					style={visible ? 
					{width: `${props.progress * 100}%`} :
					null} />	
		
		</>
	)
}


export default ProgressBar