class AudioTranslateProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }
    process(inputs: Float32Array[][]): boolean {
        // inputs是接收到的音频数据输出
        const inputChannel = inputs[0][0]; // 只用第一个通道
        this.port.postMessage(inputChannel);
        return true;
    }
}
registerProcessor("AudioTranslateProcessor", AudioTranslateProcessor);