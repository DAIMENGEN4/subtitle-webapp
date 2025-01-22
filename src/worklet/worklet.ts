class Worklet extends AudioWorkletProcessor {
    private readonly targetFrameSize: number = 320;
    private readonly targetSampleRate: number = 16000;
    private readonly nativeSampleRate: number = sampleRate;
    private inputBuffer: Array<number> = [];

    constructor(options: AudioWorkletNodeOptions) {
        super();
        this.targetFrameSize = options.processorOptions.targetFrameSize;
    }

    process(inputs: Float32Array[][]) {
        // inputs是接收到的音频数据输出
        const arrays = inputs[0][0]; // 只用第一个通道
        const frames = this.resample(arrays);
        for (const frame of frames) {
            this.port.postMessage(frame);
        }
        return true;
    }

    resample(audioFrame: Float32Array) {
        const outputFrames = []
        for (const sample of audioFrame) {
            this.inputBuffer.push(sample);
        }
        while (this.hasEnoughData()) {
            const outputFrame = this.createOutputDataFrame();
            outputFrames.push(outputFrame);
        }
        return outputFrames;
    }

    hasEnoughData() {
        return (
            (this.inputBuffer.length * this.targetSampleRate) /
            this.nativeSampleRate >=
            this.targetFrameSize
        )
    }

    createOutputDataFrame() {
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

registerProcessor("AudioWorklet", Worklet);