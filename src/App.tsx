import "./App.css";
import {Button} from "antd";
import init from "subtitle-webapp-crate";

function App() {
    // useWorker({
    //     workerPath: new URL("@WebWorker/worker-demo.ts", import.meta.url),
    // });

    return (
        <>
            <h1>SubtitleAI</h1>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            {/*<AudioRecorder/>*/}
            {/*<AudioWorkletDemo/>*/}
            <Button onClick={() => {
                // init().then(wasm => wasm.greet());
                // init().then(wasm => wasm.using_worker_demo());
                init().then(wasm => wasm.using_audio_stream());
            }}>Button</Button>
        </>
    )
}

export default App
