import "./realtime-translate.scss";
import {Button} from "antd-mobile";
import {useCallback, useEffect, useRef, useState} from "react";
import {ConfigProvider, Flex, theme} from "antd";
import {SubtitleItem} from "@R/components/realtime-translate/subtitle-item.tsx";
import {useChatListen} from "@R/components/realtime-translate/hooks/use-chat-listen.tsx";
import {useChatServiceClient} from "@R/components/realtime-translate/hooks/use-chat-service-client.tsx";
import {SileroVadV5} from "@R/silero/silero-vad-v5.ts";
import * as wasm from "subtitle-webapp-rust-crate";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import log from "@R/log/logging.ts";
import {SubtitleAssistBall} from "@R/components/realtime-translate/subtitle-assist-ball.tsx";

export const RealtimeTranslate = () => {
    const [volume, setVolume] = useState<number>(0);
    const chatServiceClient = useChatServiceClient();
    const {subtitleInfos, listenSubtitleInfos} = useChatListen();
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>();
    const subtitleContentRef = useRef<HTMLDivElement>(null);
    const realtimeTranslateContainer = useRef<HTMLDivElement>(null);
    const startRecording = useCallback(async () => {
        if (!audioContext) {
            SileroVadV5.new().then(model => {
                const url = new URL("@R/processors/audio-translate-processor.ts", import.meta.url);
                const href = url.href;
                wasm.start_realtime_translate(href, async (data: Float32Array) => {
                    const speechProbabilities = await model.process(data);
                    setVolume(speechProbabilities.isSpeech);
                    return speechProbabilities.isSpeech;
                }, (data: Float32Array) => {
                    const wavBuffer = AudioUtils.encodeWAV(data);
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
                        log.debug("Send audio data...");
                    });
                }).then(setAudioContext).catch(log.error);
            });
        } else {
            audioContext.close().then(() => setAudioContext(undefined));
        }
    }, [audioContext, chatServiceClient]);

    useEffect(() => {
        const container = subtitleContentRef.current;
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }, [subtitleInfos]);

    useEffect(() => {
        const stream = listenSubtitleInfos("wasm");
        return () => stream.cancel();
    }, [listenSubtitleInfos]);

    return (
        <div ref={realtimeTranslateContainer} className={"realtime-translate-container"}>
            <div ref={subtitleContentRef} className={"subtitle-content"}>
                <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
                    <Flex vertical>
                        {
                            subtitleInfos.map((subtitleInfo, index) => <SubtitleItem key={index}
                                                                                     subtitleInfo={subtitleInfo}/>)
                        }
                    </Flex>
                </ConfigProvider>
            </div>
            <div className={"audio-record-button-container"}>
                <div className={"volume-bar-visualization"}>
                    <div className={"volume-bar"} style={{
                        width: `${volume * 100}%`,
                        backgroundColor: volume > 0.5 ? '#4d7668' : volume > 0 ? '#4d7668' : '#D1495B',
                    }}></div>
                </div>
                <div className={"audio-record-button"}>
                    <Button style={{
                        "--background-color": "transparent",
                        "--border-style": "none",
                        "--text-color": "rgba(255, 255, 255, 1)"
                    }} onClick={startRecording}>{audioContext ? "Stop Recording" : "Start Recording"}</Button>
                </div>
            </div>
            <SubtitleAssistBall parent={realtimeTranslateContainer}/>
        </div>
    )
}