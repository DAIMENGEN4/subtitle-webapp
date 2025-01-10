import React, {useState} from "react";
import {Button} from "antd";
import log from "@R/log/logging.ts";
import * as wasm from "subtitle-webapp-rust-crate";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {SileroVadV5} from "@R/silero/silero-vad-v5.ts";
import {useChatServiceClient} from "@R/hooks/use-chat-service-client.tsx";

export const RealtimeTranslate = () => {
    const [volume, setVolume] = useState<number>(0);
    const [audioList, setAudioList] = useState<Array<string>>([]);
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>();
    const chatServiceClient = useChatServiceClient();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            backgroundColor: '#f7f7f7',
            fontFamily: 'Arial, sans-serif'
        }}>

            {/* File Input Section */}
            <div style={{
                marginBottom: '20px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <input
                    type="file"
                    accept={".wav"}
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            const arrayBuffer = await file.arrayBuffer();
                            const uint8Array = new Uint8Array(arrayBuffer);
                            const request = new ChatRequest();
                            request.setMeetingRoom("wasm");
                            request.setSpeaker("wasm-speaker");
                            request.setStart(Math.floor(new Date().getTime() / 1000));
                            request.setEnd(0);
                            request.setSampleRate(16000);
                            request.setAudioBytes(uint8Array);
                            request.setTargetLanguageList(["cmn", "eng", "jpn"]);
                            request.setTag(new Date().toISOString());
                            request.setTag64(1);
                            chatServiceClient.chatSend(request, {}).then(() => {
                                log.debug("Send audio data length: ", uint8Array.length);
                            });
                        }
                    }}
                    style={{
                        padding: '12px 20px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        width: '80%',
                        margin: '0 auto',
                        display: 'block',
                        marginBottom: '20px',
                    }}
                />
            </div>

            {/* Start Recording Button */}
            <Button
                type="primary"
                onClick={() => {
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
                                const wavBob = new Blob([wavBuffer], {type: "audio/wav"});
                                const url = URL.createObjectURL(wavBob);
                                setAudioList(old => [url, ...old]);
                            }).then(setAudioContext).catch(log.error);
                        });
                    } else {
                        audioContext.close().then(() => setAudioContext(undefined));
                    }
                }}
                style={{
                    padding: '12px 25px',
                    fontSize: '18px',
                    borderRadius: '8px',
                    width: '80%',
                    height: '50px',
                    marginBottom: '20px',
                    backgroundColor: '#91003c',
                    border: 'none',
                }}
            >
                {
                    audioContext ? "Stop Recording" : "Start Recording"
                }
            </Button>

            {/* Container for Progress Bar and Canvas */}
            <div style={{
                width: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '20px',
            }}>

                {/* Volume Bar Visualization */}
                <div style={{
                    width: '100%',
                    backgroundColor: '#ddd',
                    height: '10px',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                }}>
                    <div style={{
                        width: `${volume * 100}%`,
                        height: '100%',
                        backgroundColor: volume > 0.5 ? 'green' : volume > 0 ? 'orange' : 'red',
                        transition: 'width 0.3s ease',
                    }}></div>
                </div>
            </div>

            {/* Volume Display */}
            <div style={{
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: volume > 0.5 ? 'green' : volume > 0 ? 'orange' : 'red'
            }}>
                音量: {volume}
            </div>

            {/* Audio Playlist Section */}
            <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h3 style={{marginBottom: '15px'}}>录音列表</h3>
                <ol id="playlist" style={{
                    listStyleType: 'none',
                    padding: '0',
                    margin: '0',
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {audioList.map(audioURL => (
                        <li key={audioURL.substring(-10)} style={{
                            width: '100%',
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <audio controls src={audioURL} style={{
                                width: '100%',
                                maxWidth: '500px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                            }}/>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};
