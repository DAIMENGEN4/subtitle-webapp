import {SileroVadV5} from "@R/silero/silero-vad-v5.ts";

export class AudioRecorder {
    private readonly minSpeechFrames = 16;
    private readonly positiveSpeechThreshold = 0.75;
    private readonly workletUrl: URL;
    private readonly gainNode: GainNode;
    private readonly audioContext: AudioContext;
    private volumeListener?: (volume: number) => void;
    private readonly audioBuffer: Array<{ speechThreshold: number; audioFrame: Float32Array }> = [];

    constructor() {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 2;
        this.workletUrl = new URL("/audio-worklet.js", import.meta.url);
    }

    /**
     * 初始化音频录制器。
     * @param send 回调函数，用于发送处理后的音频数据。
     */
    async startRealtimeTranslate(send: (audioData: Float32Array) => void) {
        try {
            const sileroVadV5 = await SileroVadV5.new();
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            const mediaStreamSourceNode = this.audioContext.createMediaStreamSource(mediaStream);
            // Load the audio worklet module
            await this.audioContext.audioWorklet.addModule(this.workletUrl);
            // Configure AudioWorkletNode
            const audioWorkletNode = this.createAudioWorkletNode(sileroVadV5, send);
            // Connect nodes
            mediaStreamSourceNode
                .connect(this.gainNode)
                .connect(audioWorkletNode)
                .connect(this.audioContext.destination);
            return this.audioContext;
        } catch (error) {
            console.error("Error initializing AudioRecorder:", error);
        }
    }

    /**
     * 创建并配置 AudioWorkletNode。
     * @param sileroVadV5 Silero VAD 实例，用于处理语音活动检测。
     * @param send 回调函数，用于发送处理后的音频数据。
     * @returns 配置完成的 AudioWorkletNode。
     */
    private createAudioWorkletNode(sileroVadV5: SileroVadV5, send: (audioData: Float32Array) => void): AudioWorkletNode {
        const audioWorkletNode = new AudioWorkletNode(this.audioContext, "AudioWorklet", {
            processorOptions: {targetFrameSize: 512},
        });
        audioWorkletNode.port.onmessage = async (event) => {
            const audioFrame: Float32Array = event.data;
            try {
                const {isSpeech} = await sileroVadV5.process(audioFrame);
                this.volumeListener?.(isSpeech);
                this.audioBuffer.unshift({speechThreshold: isSpeech, audioFrame});
                this.trimAudioBuffer();
                if (this.shouldSendAudioData()) {
                    const audioData = this.aggregateAudioData();
                    send(audioData);
                }
            } catch (error) {
                console.error("Error processing audio frame:", error);
            }
        };
        return audioWorkletNode;
    }

    /**
     * 修剪音频缓冲区以确保缓冲区大小不会过大。
     */
    private trimAudioBuffer(): void {
        while (this.audioBuffer.length >= this.minSpeechFrames) {
            const lastFrames = this.audioBuffer.slice(-this.minSpeechFrames);
            const lowSpeechCount = lastFrames.filter(frame => frame.speechThreshold < this.positiveSpeechThreshold).length;

            if (lowSpeechCount >= this.minSpeechFrames / 2) {
                this.audioBuffer.pop();
            } else {
                break;
            }
        }
    }

    /**
     * 检查是否应发送音频数据。
     * @returns 如果缓冲区内的音频数据满足条件，返回 true。
     */
    private shouldSendAudioData(): boolean {
        if (this.audioBuffer.length < this.minSpeechFrames) return false;
        const thresholds = this.audioBuffer
            .slice(0, this.minSpeechFrames)
            .map(frame => frame.speechThreshold);
        return this.isMonotonicallyDecreasing(thresholds, 5);
    }

    /**
     * 聚合音频缓冲区中的数据为单个 Float32Array。
     * @returns 聚合后的音频数据。
     */
    private aggregateAudioData(): Float32Array {
        const totalSamples = this.audioBuffer.reduce((sum, frame) => sum + frame.audioFrame.length, 0);
        const audioData = new Float32Array(totalSamples);
        let offset = 0;
        while (this.audioBuffer.length > 0) {
            const frame = this.audioBuffer.pop();
            if (frame) {
                audioData.set(frame.audioFrame, offset);
                offset += frame.audioFrame.length;
            }
        }
        return audioData;
    }

    /**
     * 检查输入数组是否在指定容忍度内单调递减。
     * @param input 输入数组。
     * @param tolerance 容忍度，指定用于计算平均值的范围。
     * @returns 如果数组单调递减，返回 true。
     */
    private isMonotonicallyDecreasing(input: number[], tolerance: number): boolean {
        const n = tolerance;
        const avg = input.slice(n).reduce((acc, val) => acc + val, 0) / (input.length - n);
        return input.slice(0, n).every(value => value <= avg * 0.75);
    }

    addVolumeListener(listener: (volume: number) => void): void {
        this.volumeListener = listener;
    }
}
