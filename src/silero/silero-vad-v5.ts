import log from "@R/log/logging.ts";
import * as ort from "onnxruntime-web"

export interface SpeechProbabilities {
    notSpeech: number
    isSpeech: number
}

export const SpeechThreshold = {
    /**
     * 这个阈值用于判断模型返回的值是否表示有语音。
     * 如果模型返回的值大于此阈值，则认为是有语音活动。这一值应在0-1之间。
     * @private
     */
    positiveSpeechThreshold: 0.5,
    /**
     * 这个阈值用于判断模型返回的值是否表示没有语音。
     * 如果模型返回的值小于此阈值，则认为是没有语音活动。
     * 这一值通常设置为比positiveSpeechThreshold少0.15，这样能够更准确地区分五语音状态
     * @private
     */
    negativeSpeechThreshold: 0.5 - 0.15
};

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