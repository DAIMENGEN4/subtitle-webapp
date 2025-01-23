import init, * as wasm from "subtitle-webapp-rust-crate";
import {SileroVadV5} from "@R/silero/silero-vad-v5.ts";

type AudioFrame = { speechThreshold: number; audioFrame: Float32Array };
const minSpeechFrames = 16;
const positiveSpeechThreshold = 0.75;
const audioBuffer: Array<AudioFrame> = [];
const sileroVadV5 = await SileroVadV5.new();
await init();

self.onmessage = async (event) => {
    await processAudioFrame(event.data);
};

const processAudioFrame = async (
    audioFrame: Float32Array
) => {
    if (sileroVadV5) {
        const {isSpeech} = await sileroVadV5.process(audioFrame);
        self.postMessage({type: "speechThreshold", content: isSpeech});
        audioBuffer.unshift({speechThreshold: isSpeech, audioFrame});
        trimAudioBuffer(audioBuffer, minSpeechFrames, positiveSpeechThreshold);
        if (shouldSendAudioData(audioBuffer, minSpeechFrames)) {
            const speechData = aggregateAudioData(audioBuffer);
            self.postMessage({type: "speechData", content: speechData});
        }
    }
}

const trimAudioBuffer = (
    audioBuffer: Array<AudioFrame>,
    minSpeechFrames: number,
    positiveSpeechThreshold: number
) => {
    while (audioBuffer.length >= minSpeechFrames) {
        const lastFrames = audioBuffer.slice(-minSpeechFrames);
        const lowSpeechCount = lastFrames.filter(frame => frame.speechThreshold < positiveSpeechThreshold).length;
        if (lowSpeechCount >= minSpeechFrames / 2) {
            audioBuffer.pop();
        } else {
            break;
        }
    }
}

const shouldSendAudioData = (
    audioBuffer: Array<AudioFrame>,
    minSpeechFrames: number,
) => {
    if (audioBuffer.length < minSpeechFrames) return false;
    const thresholds = audioBuffer
        .slice(0, minSpeechFrames)
        .map(frame => frame.speechThreshold);
    return wasm.is_decreasing(new Float64Array(thresholds), 5);
}

const aggregateAudioData = (
    audioBuffer: Array<AudioFrame>,
) => {
    const totalSamples = audioBuffer.reduce((sum, frame) => sum + frame.audioFrame.length, 0);
    const audioData = new Float32Array(totalSamples);
    let offset = 0;
    while (audioBuffer.length > 0) {
        const frame = audioBuffer.pop();
        if (frame) {
            audioData.set(frame.audioFrame, offset);
            offset += frame.audioFrame.length;
        }
    }
    return audioData;
}