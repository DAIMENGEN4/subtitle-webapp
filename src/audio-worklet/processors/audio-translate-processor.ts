class AudioTranslateProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }
    process(inputs: Float32Array[][]): boolean {
        for (let i = 0; i < inputs[0].length; i++){
            if (inputs[0][i][0] > 0.50) {
                console.log("input", inputs);
            }
        }
        return true;
    }
}

registerProcessor("audio-translate-processor", AudioTranslateProcessor);