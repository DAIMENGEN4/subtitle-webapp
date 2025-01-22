import {hostname} from "@R/host.ts";
import Worker from "../worker/worker?worker";
import WorkletUrl from "../worklet/worklet?worker&url";
import {ChatServiceClient} from "subtitle-webapp-grpc-web/ChatServiceClientPb";
import * as AudioUtils from "@R/utils/audio-utils.ts";
import {ChatRequest} from "subtitle-webapp-grpc-web";
import {LargeLanguageModel} from "@R/contants/large-language-model.ts";

export class AudioService {
    private readonly worker: Worker;
    private readonly chatServiceClient: ChatServiceClient;
    private largeLanguageModel: number = LargeLanguageModel.WHISPER_M1M200;
    private volumeListener?: (volume: number) => void;

    constructor() {
        this.worker = new Worker();
        const options = null;
        const credentials = null;
        this.chatServiceClient = new ChatServiceClient(hostname, credentials, options);
    }

    async startRealtimeTranslate(room: string, speaker: string) {
        const audioContext: AudioContext = new AudioContext();
        const gainNode = audioContext.createGain();
        const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
        const mediaStreamSourceNode = audioContext.createMediaStreamSource(mediaStream);
        // Load the audio worklet module
        await audioContext.audioWorklet.addModule(WorkletUrl);
        // Configure AudioWorkletNode
        const audioWorkletNode = new AudioWorkletNode(audioContext, "AudioWorklet", {
            processorOptions: {targetFrameSize: 512},
        });
        // Listen to audio frames
        audioWorkletNode.port.onmessage = async (event) => {
            const audioFrame: Float32Array = event.data;
            this.worker.postMessage(audioFrame);
        };
        // Listen to volume
        this.worker.onmessage = (event) => {
            const eventData = event.data;
            const content = eventData.content;
            switch (eventData.type) {
                case "speechData": {
                    console.log("largeLanguageModel: ", this.largeLanguageModel);
                    const wavBuffer = AudioUtils.encodeWAV(content);
                    const request = new ChatRequest();
                    request.setMeetingRoom(room);
                    request.setSpeaker(speaker);
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
                    if (this.volumeListener) this.volumeListener(content);
                    break;
                default:
                    break;
            }
        };
        // Connect nodes
        mediaStreamSourceNode
            .connect(gainNode)
            .connect(audioWorkletNode)
            .connect(audioContext.destination);
        return audioContext;
    }

    setLargeLanguageModel(model: number) {
        this.largeLanguageModel = model;
    }

    addVolumeListener(listener: (volume: number) => void): void {
        this.volumeListener = listener;
    }
}
