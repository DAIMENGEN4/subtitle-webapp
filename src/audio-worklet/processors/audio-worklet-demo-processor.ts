class AudioWorkletDemoProcessor extends AudioWorkletProcessor {
    // 这里我们可以指定类型来加强类型检查
    process(inputs: Float32Array[][]) {
        // console.log("inputs", inputs);
        for (let i = 0; i < inputs[0].length; i++){
            if (inputs[0][i][0] > 0.75) {
                console.log("input", inputs[0][i]);
            }
        }
        // console.log("outputs", outputs);
        // console.log("parameters", parameters);
        const input = inputs[0];
        let totalVolume = 0;

        // Sum all the input samples to calculate the volume
        for (let channel = 0; channel < input.length; channel++) {
            for (let sample = 0; sample < input[channel].length; sample++) {
                totalVolume += Math.abs(input[channel][sample]);
            }
        }

        // Calculate average volume
        const averageVolume = totalVolume / (input.length * input[0].length);

        // Send the volume information to the main thread
        if (averageVolume > 0.01) {
            this.port.postMessage({isSpeaking: true});
        } else {
            this.port.postMessage({isSpeaking: false});
        }

        return true; // Keep processing
    }
}

registerProcessor("audio-worklet-demo-processor", AudioWorkletDemoProcessor);
