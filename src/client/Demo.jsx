import preactLogo from "./assets/images/preact.png";
import "./assets/stylesheets/demo.css";
import { useState } from 'preact/hooks';
import App from "./components/App"
function Demo() {

  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://preactjs.org" target="_blank">
          <img src={preactLogo} className="logo preact" alt="Preact logo" />
        </a>
      </div>
      <h1>Vite + Preact</h1>
      <div className="card">

        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/Demo.jsx</code> and save to test HMR!
        </p>
      </div>

      <App />
      
      <p className="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </div>
  );
}

export default Demo;
