import {useCallback, useEffect, useRef} from "react";

export const AudioWorkletDemo = () => {
    const audioContextRef = useRef<AudioContext | undefined>();
    const analyserNodeRef = useRef<AnalyserNode | undefined>();
    const audioWorkletNodeRef = useRef<AudioWorkletNode | undefined>();
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | undefined>();

    const stream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        audioContextRef.current = new AudioContext();
        audioContextRef.current.audioWorklet.addModule(new URL("@AudioWorklet/audio-worklet-demo-processor.ts", import.meta.url)).then(() => {
            if (audioContextRef.current) {
                analyserNodeRef.current = audioContextRef.current.createAnalyser();
                mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "audio-worklet-demo-processor");
                mediaStreamSourceRef.current.connect(analyserNodeRef.current);
                analyserNodeRef.current.connect(audioWorkletNodeRef.current);
            }
        }).catch(console.error);
    }, []);

    useEffect(() => {
        stream().then();
    }, [stream])

    return (
        <div>
            <h1>Audio Worklet Demo</h1>
        </div>
    )
}