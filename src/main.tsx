import "./index.scss"
import App from "./App.tsx"
import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import {ConfigProvider} from "antd";
import init from "subtitle-webapp-rust-crate";

init().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: "#91003c",
                }
            }}>
                <App/>
            </ConfigProvider>
        </StrictMode>,
    )
});
