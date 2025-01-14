import "./realtime-translate.scss";
import {Button, Toast} from "antd-mobile";
import {useCallback, useEffect, useRef, useState} from "react";
import {ConfigProvider, Flex, theme} from "antd";
import {SubtitleItem} from "@R/components/realtime-translate/subtitle-item.tsx";
import {useChatListen} from "@R/components/realtime-translate/hooks/use-chat-listen.tsx";
import {useChatServiceClient} from "@R/components/realtime-translate/hooks/use-chat-service-client.tsx";
import {SileroVadV5} from "@R/silero/silero-vad-v5.ts";
import * as wasm from "subtitle-webapp-rust-crate";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import {useParams} from "react-router-dom";
import log from "@R/log/logging.ts";
import {SubtitleAssistBall} from "@R/components/realtime-translate/subtitle-assist-ball.tsx";
import {useJoinRoom} from "@R/components/realtime-translate/hooks/use-join-room.tsx";
import {setRoomId} from "@R/store/features/session-slice.ts";
import {useWebappDispatch, useWebappSelector} from "@R/store/webapp-hook.ts";

export const RealtimeTranslate = () => {
    const [volume, setVolume] = useState<number>(0);
    const {_roomId} = useParams<{ _roomId: string }>();
    const {roomId, joinRoom, closeJoinRoom} = useJoinRoom();
    const {subtitleInfos, listenSubtitleInfos} = useChatListen();
    const chatServiceClient = useChatServiceClient();
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>();
    const webappDispatch = useWebappDispatch();
    const subtitleContentRef = useRef<HTMLDivElement>(null);
    const realtimeTranslateContainer = useRef<HTMLDivElement>(null);
    const largeLanguageModel = useWebappSelector(state => state.session.largeLanguageModel);
    const startRecording = useCallback(async () => {
        if (!audioContext) {
            if (roomId) {
                SileroVadV5.new().then(model => {
                    const url = new URL("/audio-translate-processor.js", import.meta.url);
                    const href = url.href;
                    wasm.start_realtime_translate(href, async (data: Float32Array) => {
                        const speechProbabilities = await model.process(data);
                        setVolume(speechProbabilities.isSpeech);
                        return speechProbabilities.isSpeech;
                    }, (data: Float32Array) => {
                        const wavBuffer = AudioUtils.encodeWAV(data);
                        const request = new ChatRequest();
                        request.setMeetingRoom(roomId);
                        request.setSpeaker("wasm-speaker");
                        request.setStart(Math.floor(new Date().getTime() / 1000));
                        request.setEnd(0);
                        request.setSampleRate(16000);
                        request.setAudioBytes(new Uint8Array(wavBuffer));
                        request.setTargetLanguageList(["cmn", "eng", "jpn"]);
                        request.setTag(new Date().toISOString());
                        request.setTag64(largeLanguageModel);
                        chatServiceClient.chatSend(request, {}).then(() => {
                            log.debug("Send audio data...");
                        });
                    }).then(setAudioContext).catch(log.error);
                });
            } else {
                Toast.show({content: "RoomId is null!"});
            }
        } else {
            audioContext.close().then(() => setAudioContext(undefined));
        }
    }, [roomId, audioContext, chatServiceClient, largeLanguageModel]);

    useEffect(() => {
        const container = subtitleContentRef.current;
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }, [subtitleInfos]);

    useEffect(() => {
        if (roomId) {
            const stream = listenSubtitleInfos(roomId);
            return () => stream.cancel();
        }
    }, [roomId, _roomId, listenSubtitleInfos]);

    useEffect(() => {
        if (!roomId && !_roomId) {
            joinRoom();
            return () => closeJoinRoom();
        } else if (_roomId) {
            webappDispatch(setRoomId(_roomId));
        }
    }, [roomId, _roomId, joinRoom, closeJoinRoom, webappDispatch]);

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