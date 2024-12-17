class AudioTranslateProcessor extends AudioWorkletProcessor {
    private inputBuffer: Array<number> = [];
    private readonly targetFrameSize: number = 320;
    private readonly targetSampleRate: number = 16000;
    private readonly nativeSampleRate: number = sampleRate;

    constructor(options: AudioWorkletNodeOptions) {
        super();
        this.targetFrameSize = options.processorOptions.targetFrameSize;
    }

    process(inputs: Float32Array[][]): boolean {
        // inputs是接收到的音频数据输出
        const arrays = inputs[0][0]; // 只用第一个通道
        const frames = this.resample(arrays);
        for (const frame of frames) {
            this.port.postMessage(frame);
        }
        return true;
    }

    private resample(audioFrame: Float32Array): Float32Array[] {
        const outputFrames: Array<Float32Array> = []
        for (const sample of audioFrame) {
            this.inputBuffer.push(sample);
        }
        while (this.hasEnoughData()) {
            const outputFrame = this.createOutputDataFrame();
            outputFrames.push(outputFrame);
        }
        return outputFrames;
    }

    private hasEnoughData(): boolean {
        return (
            (this.inputBuffer.length * this.targetSampleRate) /
            this.nativeSampleRate >=
            this.targetFrameSize
        )
    }

    private createOutputDataFrame(): Float32Array {
        const outputFrame = new Float32Array(this.targetFrameSize)
        let outputIndex = 0
        let inputIndex = 0
        while (outputIndex < this.targetFrameSize) {
            let sum = 0
            let num = 0
            while (
                inputIndex <
                Math.min(
                    this.inputBuffer.length,
                    ((outputIndex + 1) * this.nativeSampleRate) /
                    this.targetSampleRate
                )
                ) {
                const value = this.inputBuffer[inputIndex]
                if (value !== undefined) {
                    sum += value
                    num++
                }
                inputIndex++
            }
            outputFrame[outputIndex] = sum / num
            outputIndex++
        }
        this.inputBuffer = this.inputBuffer.slice(inputIndex)
        return outputFrame
    }
}

registerProcessor("AudioTranslateProcessor", AudioTranslateProcessor);