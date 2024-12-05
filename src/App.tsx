import {Button} from "antd";
import "./App.css";
// import AudioRecorder from "./audio-recorder";
import * as wasm from "subtitle-webapp-crate";
import {useWorker} from "@Root/workers/hooks/use-worker.tsx";

function App() {
    useWorker({
        workerPath: new URL("@Workers/worker-demo.ts", import.meta.url),
    });

    return (
        <>
            <h1>SubtitleAI</h1>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            {/* <AudioRecorder/> */}
            <Button onClick={() => {
                wasm.using_audio_demo().then(() => {
                    console.log("start recording");
                });
            }}>Button</Button>
        </>
    )
}

export default App
