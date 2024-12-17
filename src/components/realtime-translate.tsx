import {Button} from "antd";
import log from "@Root/logging";
import * as wasm from "subtitle-webapp-crate";
import {SileroVadV5} from "@Root/models/silero-vad-v5.ts";

export const RealtimeTranslate = () => {
    return (
        <div>
            <Button type={"primary"} onClick={() => {
                SileroVadV5.new().then(model => {
                    const url = new URL("@AudioWorklet/audio-translate-processor.ts", import.meta.url);
                    const href = url.href;
                    wasm.start_realtime_translate(href, async (data: Float32Array) => {
                        const speechProbabilities = await model.process(data);
                        return speechProbabilities.isSpeech;
                    }).then(log.debug);
                });
            }}>Start Translate Audio</Button>
        </div>
    );
}