import {useCallback, useEffect, useMemo, useState} from "react";
import {useWebappSelector} from "@R/store/webapp-hook";
import {AudioService} from "@R/audio/audio-service.ts";

export const useStartRecording = () => {
    const [volume, setVolume] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>();
    const audioService = useMemo(() => new AudioService(), []);
    const speaker = useWebappSelector(state => state.static.speaker);
    const largeLanguageModel = useWebappSelector(state => state.session.largeLanguageModel);
    useEffect(() => {
        audioService.setSpeaker(speaker);
    }, [audioService, speaker]);
    useEffect(() => {
        audioService.setModel(largeLanguageModel);
    }, [audioService, largeLanguageModel]);
    const stopRecording = useCallback(() => {
        audioService.removeListener();
        audioService.stop().then(setIsRecording);
    }, [audioService]);
    const startRecording = useCallback((room: string) => {
        audioService.addListener(setVolume);
        audioService.start(room).then(setIsRecording);
    }, [audioService]);
    return {
        volume: volume,
        isRecording: isRecording,
        stopRecording: stopRecording,
        startRecording: startRecording,
    }
}