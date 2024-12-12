import "./index.css";
import App from "./App.tsx";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import init from "subtitle-webapp-crate";

init().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App/>
        </StrictMode>,
    )
})
