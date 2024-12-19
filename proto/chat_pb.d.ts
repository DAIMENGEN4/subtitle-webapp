import * as jspb from 'google-protobuf'



export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class CreateRequest extends jspb.Message {
  getMeetingRoom(): string;
  setMeetingRoom(value: string): CreateRequest;

  getPassword(): string;
  setPassword(value: string): CreateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateRequest): CreateRequest.AsObject;
  static serializeBinaryToWriter(message: CreateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateRequest;
  static deserializeBinaryFromReader(message: CreateRequest, reader: jspb.BinaryReader): CreateRequest;
}

export namespace CreateRequest {
  export type AsObject = {
    meetingRoom: string,
    password: string,
  }
}

export class CreateRespond extends jspb.Message {
  getResult(): boolean;
  setResult(value: boolean): CreateRespond;

  getMessage(): string;
  setMessage(value: string): CreateRespond;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateRespond.AsObject;
  static toObject(includeInstance: boolean, msg: CreateRespond): CreateRespond.AsObject;
  static serializeBinaryToWriter(message: CreateRespond, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateRespond;
  static deserializeBinaryFromReader(message: CreateRespond, reader: jspb.BinaryReader): CreateRespond;
}

export namespace CreateRespond {
  export type AsObject = {
    result: boolean,
    message: string,
  }
}

export class ChatRespond extends jspb.Message {
  getSpeaker(): string;
  setSpeaker(value: string): ChatRespond;

  getStart(): number;
  setStart(value: number): ChatRespond;

  getEnd(): number;
  setEnd(value: number): ChatRespond;

  getTargetLanguageList(): Array<string>;
  setTargetLanguageList(value: Array<string>): ChatRespond;
  clearTargetLanguageList(): ChatRespond;
  addTargetLanguage(value: string, index?: number): ChatRespond;

  getTranslatedTextList(): Array<string>;
  setTranslatedTextList(value: Array<string>): ChatRespond;
  clearTranslatedTextList(): ChatRespond;
  addTranslatedText(value: string, index?: number): ChatRespond;

  getTag(): string;
  setTag(value: string): ChatRespond;

  getTag64(): number;
  setTag64(value: number): ChatRespond;

  getOriginText(): string;
  setOriginText(value: string): ChatRespond;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatRespond.AsObject;
  static toObject(includeInstance: boolean, msg: ChatRespond): ChatRespond.AsObject;
  static serializeBinaryToWriter(message: ChatRespond, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatRespond;
  static deserializeBinaryFromReader(message: ChatRespond, reader: jspb.BinaryReader): ChatRespond;
}

export namespace ChatRespond {
  export type AsObject = {
    speaker: string,
    start: number,
    end: number,
    targetLanguageList: Array<string>,
    translatedTextList: Array<string>,
    tag: string,
    tag64: number,
    originText: string,
  }
}

export class MeetingRoom extends jspb.Message {
  getMeetingRoom(): string;
  setMeetingRoom(value: string): MeetingRoom;

  getPassword(): string;
  setPassword(value: string): MeetingRoom;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MeetingRoom.AsObject;
  static toObject(includeInstance: boolean, msg: MeetingRoom): MeetingRoom.AsObject;
  static serializeBinaryToWriter(message: MeetingRoom, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MeetingRoom;
  static deserializeBinaryFromReader(message: MeetingRoom, reader: jspb.BinaryReader): MeetingRoom;
}

export namespace MeetingRoom {
  export type AsObject = {
    meetingRoom: string,
    password: string,
  }
}

export class ChatRequest extends jspb.Message {
  getMeetingRoom(): string;
  setMeetingRoom(value: string): ChatRequest;

  getSpeaker(): string;
  setSpeaker(value: string): ChatRequest;

  getStart(): number;
  setStart(value: number): ChatRequest;

  getEnd(): number;
  setEnd(value: number): ChatRequest;

  getSampleRate(): number;
  setSampleRate(value: number): ChatRequest;

  getAudioBytes(): Uint8Array | string;
  getAudioBytes_asU8(): Uint8Array;
  getAudioBytes_asB64(): string;
  setAudioBytes(value: Uint8Array | string): ChatRequest;

  getTargetLanguageList(): Array<string>;
  setTargetLanguageList(value: Array<string>): ChatRequest;
  clearTargetLanguageList(): ChatRequest;
  addTargetLanguage(value: string, index?: number): ChatRequest;

  getTag(): string;
  setTag(value: string): ChatRequest;

  getTag64(): number;
  setTag64(value: number): ChatRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChatRequest): ChatRequest.AsObject;
  static serializeBinaryToWriter(message: ChatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatRequest;
  static deserializeBinaryFromReader(message: ChatRequest, reader: jspb.BinaryReader): ChatRequest;
}

export namespace ChatRequest {
  export type AsObject = {
    meetingRoom: string,
    speaker: string,
    start: number,
    end: number,
    sampleRate: number,
    audioBytes: Uint8Array | string,
    targetLanguageList: Array<string>,
    tag: string,
    tag64: number,
  }
}

