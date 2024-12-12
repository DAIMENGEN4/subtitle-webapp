import {Button} from "antd";
import * as wasm from "subtitle-webapp-crate";
export const RealtimeTranslate = () => {
    return (
        <div>
            <Button type={"primary"} onClick={() => {
                const url = new URL("@AudioWorklet/audio-translate-processor.ts", import.meta.url);
                const href = url.href;
                wasm.start_realtime_translate(href).then(console.log)
            }}>Start Translate Audio</Button>
        </div>
    );
}