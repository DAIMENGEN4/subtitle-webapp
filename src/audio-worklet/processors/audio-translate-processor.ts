class AudioTranslateProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }
    process(inputs: Float32Array[][]): boolean {
        this.port.postMessage(inputs[0][0]);
        return true;
    }
}
registerProcessor("AudioTranslateProcessor", AudioTranslateProcessor);