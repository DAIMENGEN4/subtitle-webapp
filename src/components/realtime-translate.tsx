import {Button} from "antd";
import log from "@Root/logging";
import * as wasm from "subtitle-webapp-crate";
import {SileroVadV5} from "@Root/models/silero-vad-v5.ts";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import {ChatServiceClient} from "subtitle-webapp-grpc-web/ChatServiceClientPb";
import {useMemo, useState} from "react";
import * as AudioUtils from "@Root/utils/audio-utils.ts";
import {hostname} from "@Root/host.ts";

export const RealtimeTranslate = () => {
    const options = null;
    const credentials = null;
    const chatServiceClient = useMemo(() => new ChatServiceClient(hostname, credentials, options), [options, credentials]);
    const [audioList, setAudioList] = useState<Array<string>>([]);
    return (
        <div>
            <Button type={"primary"} onClick={() => {
                SileroVadV5.new().then(model => {
                    const url = new URL("@AudioWorklet/audio-translate-processor.ts", import.meta.url);
                    const href = url.href;
                    wasm.start_realtime_translate(href, async (data: Float32Array) => {
                        const speechProbabilities = await model.process(data);
                        return speechProbabilities.isSpeech;
                    }, (data: Float32Array) => {
                        const wavBuffer = AudioUtils.encodeWAV(data);
                        const wavBob = new Blob([wavBuffer], {type: "audio/wav"});
                        const url = URL.createObjectURL(wavBob);
                        setAudioList(old => [url, ...old]);
                        const request = new ChatRequest();
                        request.setMeetingRoom("wasm");
                        request.setSpeaker("wasm-speaker");
                        request.setStart(Math.floor(new Date().getTime() / 1000));
                        request.setEnd(0);
                        request.setSampleRate(16000);
                        request.setAudioBytes(new Uint8Array(wavBuffer));
                        request.setTargetLanguageList(["cmn", "eng", "jpn"]);
                        request.setTag(new Date().toISOString());
                        request.setTag64(1);
                        chatServiceClient.chatSend(request, {}).then(() => {
                            log.debug("Send audio data length: ", data.length);
                        });
                    }).then(log.debug);
                });
            }}>Start Translate Audio</Button>

            <div>
                <ol id="playlist">
                    {audioList.map((audioURL) => {
                        return (
                            <li key={audioURL.substring(-10)}>
                                <audio controls src={audioURL}/>
                            </li>
                        )
                    })}
                </ol>
            </div>

            <div>
                <ol id="playlist">
                    {audioList.map((audioURL) => {
                        return (
                            <li key={audioURL.substring(-10)}>
                                <a href={audioURL}>音频文件</a>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </div>
    );
}