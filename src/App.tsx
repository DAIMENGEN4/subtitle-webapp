import "./App.scss"
import {BrowserRouter} from "react-router-dom";
import {WebappRoute} from "@R/route/webapp-route.tsx";

function App() {
    return (
        <BrowserRouter>
            <WebappRoute/>
        </BrowserRouter>
    )
}

export default App
