# Subtitle AI Webapp

## Grpc

### Environment
Install protoc and protoc-gen-grpc-web

Tips: The version of protoc should be below 3.20.1, otherwise, unexpected bugs may occur.

### Generate Code
```shell

protoc --proto_path=./proto chat.proto --js_out=import_style=commonjs:./proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:./proto
```

