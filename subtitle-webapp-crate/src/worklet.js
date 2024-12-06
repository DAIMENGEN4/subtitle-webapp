registerProcessor("AudioProcessor", class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        let [module, memory, handle] = options.processorOptions;
        console.log("module: ", module);
        console.log("memory: ", memory);
        console.log("handle: ", handle);
        bindgen.initSync({ module, memory });
        console.log("bindgen: ", bindgen)
        this.processor = bindgen.AudioProcessor.unpack(handle);
    }
    process(inputs, outputs, parameters) {
        console.log("process: ", inputs);
        return this.processor.process(outputs[0][0]);
    }
})