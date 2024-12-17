use wasm_bindgen::prelude::*;

mod utils;
mod wasm_audio;


/// 这是一个 Demo 方法，主要目的是演示如何在 WebAssembly 中使用 tokio 的消息传递的功能
#[wasm_bindgen]
pub fn using_worker_demo() {
    console_log!("using_worker_demo");
    // // 创建一个消息通道
    // let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(32);
    //
    // // 创建一个异步任务，用于接收消息
    // wasm_bindgen_futures::spawn_local(async move {
    //     while let Some(message) = rx.recv().await {
    //         console_log!("Received message: {}", message);
    //     }
    // });
    //
    // // 创建一个异步任务，用于发送消息
    // wasm_bindgen_futures::spawn_local(async move {
    //     loop {
    //         // 发送消息
    //         tx.send("Hello from Rust!".to_string()).await.unwrap();
    //     }
    // });
}