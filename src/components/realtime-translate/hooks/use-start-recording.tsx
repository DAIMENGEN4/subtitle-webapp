import {useCallback, useState} from "react";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {useWebappSelector} from "@R/store/webapp-hook";
import {useChatServiceClient} from "@R/components/realtime-translate/hooks/use-chat-service-client.tsx";
import {AudioRecorder} from "@R/audio/audio-recorder.ts";

export const useStartRecording = () => {
    const [volume, setVolume] = useState<number>(0);
    const chatServiceClient = useChatServiceClient();
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>();
    const speaker = useWebappSelector(state => state.static.speaker);
    const largeLanguageModel = useWebappSelector(state => state.session.largeLanguageModel);
    const stopRecording = useCallback(() => {
        if (audioContext) {
            audioContext.close().then(() => setAudioContext(undefined));
        }
    }, [audioContext]);
    const startRecording = useCallback((roomId: string) => {
        // SileroVadV5.new().then(model => {
        //     const url = new URL("/audio-translate-processor.js", import.meta.url);
        //     const href = url.href;
        //     wasm.start_realtime_translate(href, async (data: Float32Array) => {
        //         const speechProbabilities = await model.process(data);
        //         setVolume(speechProbabilities.isSpeech);
        //         return speechProbabilities.isSpeech;
        //     }, (data: Float32Array) => {
        //         const wavBuffer = AudioUtils.encodeWAV(data);
        //         const request = new ChatRequest();
        //         request.setMeetingRoom(roomId);
        //         request.setSpeaker(speaker);
        //         request.setStart(Math.floor(new Date().getTime() / 1000));
        //         request.setEnd(0);
        //         request.setSampleRate(16000);
        //         request.setAudioBytes(new Uint8Array(wavBuffer));
        //         request.setTargetLanguageList(["cmn", "eng", "jpn"]);
        //         request.setTag(new Date().toISOString());
        //         request.setTag64(largeLanguageModel);
        //         chatServiceClient.chatSend(request, {}).then();
        //     }).then(setAudioContext).catch(log.error);
        // });
        const audioRecorder = new AudioRecorder();
        audioRecorder.addVolumeListener(setVolume);
        audioRecorder.startRealtimeTranslate(async (data: Float32Array) => {
            const wavBuffer = AudioUtils.encodeWAV(data);
            const request = new ChatRequest();
            request.setMeetingRoom(roomId);
            request.setSpeaker(speaker);
            request.setStart(Math.floor(new Date().getTime() / 1000));
            request.setEnd(0);
            request.setSampleRate(16000);
            request.setAudioBytes(new Uint8Array(wavBuffer));
            request.setTargetLanguageList(["cmn", "eng", "jpn"]);
            request.setTag(new Date().toISOString());
            request.setTag64(largeLanguageModel);
            chatServiceClient.chatSend(request, {}).then();
        }).then(setAudioContext);

    }, [chatServiceClient, largeLanguageModel, speaker]);
    return {
        volume: volume,
        isRecording: !!audioContext,
        stopRecording: stopRecording,
        startRecording: startRecording,
    }
}