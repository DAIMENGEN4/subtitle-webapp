import "./realtime-translate.scss";
import {Button} from "antd-mobile";
import {useEffect, useRef, useState} from "react";
import {ConfigProvider, Flex, theme} from "antd";
import {SubtitleItem} from "@R/components/realtime-translate/subtitle-item.tsx";
import {useChatListen} from "@R/components/realtime-translate/hooks/use-chat-listen.tsx";
import {useParams} from "react-router-dom";
import {SubtitleAssistBall} from "@R/components/realtime-translate/subtitle-assist-ball.tsx";
import {useWebappDispatch, useWebappSelector} from "@R/store/webapp-hook.ts";
import {JoinRoom} from "@R/components/realtime-translate/join-room/join-room.tsx";
import {StringUtils} from "@R/utils/string-utils.ts";
import {setRoomId} from "@R/store/features/session-slice.ts";
import {useStartRecording} from "@R/components/realtime-translate/hooks/use-start-recording.tsx";

export const RealtimeTranslate = () => {
    const {_roomId} = useParams<{ _roomId: string }>();
    const [visible, setVisible] = useState<boolean>(false);
    const {subtitleInfos, listenSubtitleInfos} = useChatListen();
    const webappDispatch = useWebappDispatch();
    const {volume, isRecording, stopRecording, startRecording} = useStartRecording();
    const subtitleContentRef = useRef<HTMLDivElement>(null);
    const realtimeTranslateContainer = useRef<HTMLDivElement>(null);
    const roomId = useWebappSelector(state => state.session.roomId);

    useEffect(() => {
        const container = subtitleContentRef.current;
        if (container) {
            const frameId = requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
            return () => cancelAnimationFrame(frameId);
        }
    }, [subtitleInfos]);

    useEffect(() => {
        if (roomId) {
            const stream = listenSubtitleInfos(roomId);
            return () => stream.cancel();
        }
    }, [roomId, listenSubtitleInfos]);

    useEffect(() => {
        if (StringUtils.hasValue(roomId) || StringUtils.hasValue(_roomId)) {
            setVisible(false);
            if (StringUtils.hasValue(_roomId)) {
                webappDispatch(setRoomId(_roomId));
            }
        } else {
            setVisible(true);
        }
    }, [roomId, _roomId, webappDispatch]);

    return (
        <>
            <JoinRoom visible={visible}/>
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
                        }} onClick={() => {
                            if (roomId) {
                                if (isRecording) {
                                    stopRecording();
                                } else {
                                    startRecording(roomId);
                                }
                            }
                        }}>{isRecording ? "Stop Recording" : "Start Recording"}</Button>
                    </div>
                </div>
                <SubtitleAssistBall parent={realtimeTranslateContainer}/>
            </div>
        </>
    )
}