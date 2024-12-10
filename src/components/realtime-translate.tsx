import {Button} from "antd";
import {useCallback, useRef} from "react";

export const RealtimeTranslate = () => {
    const audioContextRef = useRef<AudioContext | undefined>();
    const analyserNodeRef = useRef<AnalyserNode | undefined>();
    const audioWorkletNodeRef = useRef<AudioWorkletNode | undefined>();
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | undefined>();

    const startTranslateAudio = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        audioContextRef.current = new AudioContext();
        audioContextRef.current.audioWorklet.addModule(new URL("@AudioWorklet/audio-translate-processor.ts", import.meta.url)).then(() => {
            if (audioContextRef.current) {
                analyserNodeRef.current = audioContextRef.current.createAnalyser();
                mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "audio-translate-processor");
                mediaStreamSourceRef.current.connect(analyserNodeRef.current);
                analyserNodeRef.current.connect(audioWorkletNodeRef.current);
            }
        }).catch(console.error);
    }, []);
    return (
        <div>
            <Button type={"primary"} onClick={startTranslateAudio}>Start Translate Audio</Button>
        </div>
    );
}