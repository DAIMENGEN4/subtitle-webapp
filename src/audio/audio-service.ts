import {hostname} from "@R/host.ts";
import Worker from "@R/audio/worker/worker?worker";
import WorkletUrl from "@R/audio/worklet/worklet?worker&url";
import {ChatServiceClient} from "subtitle-webapp-grpc-web/ChatServiceClientPb";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import {LargeLanguageModel} from "@R/contants/large-language-model.ts";

export class AudioService {
    private worker?: Worker;
    private audioContext?: AudioContext;
    private readonly chatServiceClient: ChatServiceClient;
    private speaker: string = "unknown";
    private largeLanguageModel: number = LargeLanguageModel.WHISPER_M1M200;
    private listener?: (volume: number) => void;

    constructor() {
        const options = null;
        const credentials = null;
        this.chatServiceClient = new ChatServiceClient(hostname, credentials, options);
    }

    async start(room: string): Promise<boolean> {
        this.worker = new Worker();
        this.audioContext = new AudioContext();
        const gainNode = this.audioContext.createGain();
        const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
        const mediaStreamSourceNode = this.audioContext.createMediaStreamSource(mediaStream);
        // Load the audio worklet module
        await this.audioContext.audioWorklet.addModule(WorkletUrl);
        // Configure AudioWorkletNode
        const audioWorkletNode = new AudioWorkletNode(this.audioContext, "AudioWorklet", {
            processorOptions: {targetFrameSize: 512},
        });
        // Listen to audio frames
        audioWorkletNode.port.onmessage = async (event) => {
            const audioFrame: Float32Array = event.data;
            this.worker?.postMessage(audioFrame);
        };
        // Listen to volume
        this.worker.onmessage = (event) => {
            const eventData = event.data;
            const content = eventData.content;
            switch (eventData.type) {
                case "speechData": {
                    const wavBuffer = AudioUtils.encodeWAV(content);
                    const request = new ChatRequest();
                    request.setMeetingRoom(room);
                    request.setSpeaker(this.speaker);
                    request.setStart(Math.floor(new Date().getTime() / 1000));
                    request.setEnd(0);
                    request.setSampleRate(16000);
                    request.setAudioBytes(new Uint8Array(wavBuffer));
                    request.setTargetLanguageList(["cmn", "eng", "jpn"]);
                    request.setTag(new Date().toISOString());
                    request.setTag64(this.largeLanguageModel);
                    this.chatServiceClient.chatSend(request, {}).then();
                    break;
                }
                case "speechThreshold":
                    if (this.listener) this.listener(content);
                    break;
                default:
                    break;
            }
        };
        // Connect nodes
        mediaStreamSourceNode
            .connect(gainNode)
            .connect(audioWorkletNode)
            .connect(this.audioContext.destination);
        return true;
    }

    async stop() {
        this.worker?.terminate();
        await this.audioContext?.close();
        return false;
    }

    setModel(model: number) {
        this.largeLanguageModel = model;
    }

    setSpeaker(speaker: string) {
        this.speaker = speaker;
    }

    addListener(listener: (volume: number) => void): void {
        this.listener = listener;
    }

    removeListener(): void {
        this.listener = undefined;
    }
}
