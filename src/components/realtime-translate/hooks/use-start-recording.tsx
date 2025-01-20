import {useCallback, useState} from "react";
import log from "@R/log/logging.ts";
import * as wasm from "subtitle-webapp-rust-crate";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {SileroVadV5} from "@R/silero/silero-vad-v5.ts";
import {useWebappSelector} from "@R/store/webapp-hook";
import {useChatServiceClient} from "@R/components/realtime-translate/hooks/use-chat-service-client.tsx";

export const useStartRecording = () => {
    const [volume, setVolume] = useState<number>(0);
    const chatServiceClient = useChatServiceClient();
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>();
    const largeLanguageModel = useWebappSelector(state => state.session.largeLanguageModel);
    const stopRecording = useCallback(() => {
        if (audioContext) {
            audioContext.close().then(() => setAudioContext(undefined));
        }
    }, [audioContext]);
    const startRecording = useCallback((roomId: string) => {
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
                chatServiceClient.chatSend(request, {}).then();
            }).then(setAudioContext).catch(log.error);
        });
    }, [chatServiceClient, largeLanguageModel]);
    return {
        volume: volume,
        isRecording: !!audioContext,
        stopRecording: stopRecording,
        startRecording: startRecording,
    }
}