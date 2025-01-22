import {useCallback, useEffect, useMemo, useState} from "react";
import {useWebappSelector} from "@R/store/webapp-hook";
import {AudioService} from "@R/audio/audio-service.ts";

export const useStartRecording = () => {
    const [volume, setVolume] = useState<number>(0);
    const [audioContext, setAudioContext] = useState<AudioContext | undefined>();
    const audioRecorder = useMemo(() => new AudioService(), []);
    const largeLanguageModel = useWebappSelector(state => state.session.largeLanguageModel);
    useEffect(() => {
        audioRecorder.setLargeLanguageModel(largeLanguageModel);
    }, [audioRecorder, largeLanguageModel]);
    const stopRecording = useCallback(() => {
        if (audioContext) {
            audioContext.close().then(() => setAudioContext(undefined));
        }
    }, [audioContext]);
    const startRecording = useCallback((room: string, speaker: string) => {
        audioRecorder.addVolumeListener(setVolume);
        audioRecorder.startRealtimeTranslate(room, speaker).then(setAudioContext);
    }, [audioRecorder]);
    return {
        volume: volume,
        isRecording: !!audioContext,
        stopRecording: stopRecording,
        startRecording: startRecording,
    }
}