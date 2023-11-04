import "../../assets/stylesheets/fullscreen_modal.scss"
import {useRef} from "preact/hooks"
import {BrowserLogger as Logger} from "../../../shared/libs/Logger.mjs"

const FullscreenModal = (props) => {

	const imgRef = useRef(null)

	const close_modal = (event) => {
		if (event.target === imgRef.current) {
			Logger.debug("Image was clicked")
			return
		}
		props.setFS(false)
	}

	return (
		<div className="fs-modal" onClick={close_modal}>
			<div className="fs-modal-close"
					onClick={close_modal} />
			<div className="fs-image-container">
				<img className="fs-image"
					src={props.message.url}
					ref={imgRef} />
			</div>
			<div className="fs-modal-meta" />
		</div>
	)

}

export default FullscreenModal