import "./App.css";
import {useEffect} from "react";
import * as wasm from "subtitle-webapp-crate";

function App() {
    useEffect(() => {
        // wasm.greet();
        wasm.using_web_sys_console_log_1("using_web_sys_console_log_1");
        wasm.using_web_sys_console_log_2("using_web_sys_console_log_2", 200000);
        wasm.using_web_sys_get_user_media().then(() => {
            wasm.using_web_sys_get_input_device().then(console.log);
        });
    }, []);
    return (
        <>
            <h1>SubtitleAI</h1>
        </>
    )
}

export default App
