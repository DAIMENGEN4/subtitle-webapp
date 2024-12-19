/**
 * @fileoverview gRPC-Web generated client stub for chat.service
 * @enhanceable
 * @public
 */

// Code generated by protoc-gen-grpc-web. DO NOT EDIT.
// versions:
// 	protoc-gen-grpc-web v1.4.1
// 	protoc              v3.20.0
// source: chat.proto


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as chat_pb from './chat_pb';


export class ChatServiceClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: any; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname.replace(/\/+$/, '');
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodDescriptorCreateChat = new grpcWeb.MethodDescriptor(
    '/chat.service.ChatService/CreateChat',
    grpcWeb.MethodType.UNARY,
    chat_pb.CreateRequest,
    chat_pb.CreateRespond,
    (request: chat_pb.CreateRequest) => {
      return request.serializeBinary();
    },
    chat_pb.CreateRespond.deserializeBinary
  );

  createChat(
    request: chat_pb.CreateRequest,
    metadata: grpcWeb.Metadata | null): Promise<chat_pb.CreateRespond>;

  createChat(
    request: chat_pb.CreateRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: chat_pb.CreateRespond) => void): grpcWeb.ClientReadableStream<chat_pb.CreateRespond>;

  createChat(
    request: chat_pb.CreateRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: chat_pb.CreateRespond) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/chat.service.ChatService/CreateChat',
        request,
        metadata || {},
        this.methodDescriptorCreateChat,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/chat.service.ChatService/CreateChat',
    request,
    metadata || {},
    this.methodDescriptorCreateChat);
  }

  methodDescriptorChatSend = new grpcWeb.MethodDescriptor(
    '/chat.service.ChatService/ChatSend',
    grpcWeb.MethodType.UNARY,
    chat_pb.ChatRequest,
    chat_pb.Empty,
    (request: chat_pb.ChatRequest) => {
      return request.serializeBinary();
    },
    chat_pb.Empty.deserializeBinary
  );

  chatSend(
    request: chat_pb.ChatRequest,
    metadata: grpcWeb.Metadata | null): Promise<chat_pb.Empty>;

  chatSend(
    request: chat_pb.ChatRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: chat_pb.Empty) => void): grpcWeb.ClientReadableStream<chat_pb.Empty>;

  chatSend(
    request: chat_pb.ChatRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: chat_pb.Empty) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/chat.service.ChatService/ChatSend',
        request,
        metadata || {},
        this.methodDescriptorChatSend,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/chat.service.ChatService/ChatSend',
    request,
    metadata || {},
    this.methodDescriptorChatSend);
  }

  methodDescriptorChatListen = new grpcWeb.MethodDescriptor(
    '/chat.service.ChatService/ChatListen',
    grpcWeb.MethodType.SERVER_STREAMING,
    chat_pb.MeetingRoom,
    chat_pb.ChatRespond,
    (request: chat_pb.MeetingRoom) => {
      return request.serializeBinary();
    },
    chat_pb.ChatRespond.deserializeBinary
  );

  chatListen(
    request: chat_pb.MeetingRoom,
    metadata?: grpcWeb.Metadata): grpcWeb.ClientReadableStream<chat_pb.ChatRespond> {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/chat.service.ChatService/ChatListen',
      request,
      metadata || {},
      this.methodDescriptorChatListen);
  }

}

