import { AppState, createAppState } from "../state/app_state.js";
import Toggle from "./Toggle"
import Chat from "./Chat"

const App = () => {

	return (
		<AppState.Provider value={createAppState()}>
			<Toggle />
			<Chat />
		</AppState.Provider>
	)

}

export default App