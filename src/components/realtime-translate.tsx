import {Button} from "antd";
import log from "@Root/logging";
import * as wasm from "subtitle-webapp-crate";
export const RealtimeTranslate = () => {
    return (
        <div>
            <Button type={"primary"} onClick={() => {
                const url = new URL("@AudioWorklet/audio-translate-processor.ts", import.meta.url);
                const href = url.href;
                wasm.start_realtime_translate(href, (data: Float32Array) => {
                    log.debug(data);
                }).then(log.debug);
            }}>Start Translate Audio</Button>
        </div>
    );
}