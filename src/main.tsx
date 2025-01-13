import "./index.scss"
import App from "./App.tsx"
import {StrictMode} from "react"
import {ConfigProvider} from "antd";
import {Provider} from "react-redux";
import {createRoot} from "react-dom/client"
import init from "subtitle-webapp-rust-crate";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, webappStore} from "@R/store/webapp-store.ts";

init().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <Provider store={webappStore}>
                <PersistGate persistor={persistor}>
                    <ConfigProvider theme={{
                        token: {
                            colorPrimary: "#91003c",
                        }
                    }}>
                        <App/>
                    </ConfigProvider>
                </PersistGate>
            </Provider>
        </StrictMode>
    )
});
