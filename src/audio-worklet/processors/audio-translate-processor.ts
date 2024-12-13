class AudioTranslateProcessor extends AudioWorkletProcessor {
    fftSize: number;
    threshold: number;
    buffer: Float32Array;
    constructor() {
        super();
        this.fftSize = 128;
        this.threshold = 0.1;
        this.buffer = new Float32Array(this.fftSize);
    }
    process(inputs: Float32Array[][]): boolean {
        // inputs是接收到的音频数据输出
        const inputChannel = inputs[0][0]; // 只用第一个通道
        // TODO 下面的人声识别时临时写的，后续需要考虑选择其他的方法，目前暂时不做考虑
        let sum = 0;
        for (let i = 0; i < this.fftSize; i++) {
            this.buffer[i] = inputChannel[i];
            sum += this.buffer[i] * this.buffer[i];
        }
        const averageVolume = sum / this.fftSize;
        if (averageVolume > this.threshold) {
            console.log("Voice detected");
            this.port.postMessage(inputs[0][0]);
        } else {
            console.log("No voice detected");
        }
        return true;
    }
}
registerProcessor("AudioTranslateProcessor", AudioTranslateProcessor);