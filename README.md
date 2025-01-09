# SubtitleWebapp 项目说明

本项目使用 TypeScript 和 Rust WebAssembly 的开发。以下是项目中常用的命令及其功能。

## 脚本命令

### 启动项目

- **`yarn start`**: 启动网站，用于本地开发。

### 构建项目

- **`yarn build`**: 构建生产版本。

### 代码检查

- **`yarn lint`**: 运行 ESLint 检查代码规范。  
  **命令**: `eslint .`  
  **说明**: 检查项目中的 JavaScript 和 TypeScript 代码是否符合规范。

### 预览项目

- **`yarn preview`**: 运行生产版本预览模式。  
  **命令**: `vite preview`  
  **说明**: 构建完后，启动预览服务器查看生产版本。

### gRPC-Web 生成代码

- **`yarn grpc-web`**: 使用 `protoc` 工具生成 gRPC-Web 客户端代码。  
  **命令**: `./protoc-3.20.0-win64/bin/protoc --proto_path=./proto chat.proto --js_out=import_style=commonjs:./proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:./proto`  
  **说明**: 编译 `.proto` 文件并生成 TypeScript 客户端代码以供 gRPC-Web 使用。

### 构建 WebAssembly (Wasm) 模块

- **`yarn wasm-web`**: 构建 WebAssembly 模块并生成 web 目标的代码。  
  **命令**: `wasm-pack build ./subtitle-webapp-rust-crate --target web && yarn update`  
  **说明**: 使用 `wasm-pack` 构建 Rust WebAssembly 模块，并通过 `yarn update` 更新相关依赖。

- **`wasm-no-modules`**: 构建 WebAssembly 模块，生成没有模块化支持的代码。  
  **命令**: `wasm-pack build ./subtitle-webapp-rust-crate --target no-modules`  
  **说明**: 构建不支持模块化的 WebAssembly 代码，适用于某些不支持模块的环境。

---

以上是项目中常用命令的介绍，执行这些命令可以帮助你进行开发、构建、更新和调试。
