import log from "@Root/logging";
import * as ort from "onnxruntime-web"

export interface SpeechProbabilities {
    notSpeech: number
    isSpeech: number
}

function getNewState(ortInstance: typeof ort) {
    const zeroes = Array(2 * 128).fill(0)
    return new ortInstance.Tensor("float32", zeroes, [2, 1, 128])
}

export class SileroVadV5 {
    constructor(
        private _session: ort.InferenceSession,
        private _state: ort.Tensor,
        private _sr: ort.Tensor,
        private ortInstance: typeof ort
    ) {
    }

    static async new() {
        log.debug("Loading Silero VAD v5");
        const url = new URL("../../silero_vad_v5.onnx", import.meta.url);
        const _session = await ort.InferenceSession.create(url.href);
        const _sr = new ort.Tensor("int64", [16000n]);
        const _state = getNewState(ort);
        log.debug("Loaded Silero VAD v5");
        return new SileroVadV5(_session, _state, _sr, ort);
    }

    async process(audioFrame: Float32Array): Promise<SpeechProbabilities> {
        const t = new this.ortInstance.Tensor("float32", audioFrame, [
            1,
            audioFrame.length,
        ]);
        const inputs = {
            input: t,
            state: this._state,
            sr: this._sr,
        }
        const out = await this._session.run(inputs);
        this._state = out["stateN"];
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [isSpeech] = out["output"]?.data;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const notSpeech = 1 - isSpeech;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return {notSpeech, isSpeech};
    }
}