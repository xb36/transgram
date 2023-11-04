import App from "./components/App"
import config from "./client_configuration"

var styleSheet = document.createElement("link")
styleSheet.rel = "stylesheet"
styleSheet.type = "text/css"
styleSheet.href = `${import.meta.env.BASE_URL}/assets/App.css`
document.head.prepend(styleSheet)

const render_chat = () => {
	render(<App />, document.getElementById(config.transgram_root_id));
}
setTimeout(render_chat, 500) // workaround to be certain the css was parsed